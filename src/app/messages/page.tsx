import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/utils/format";
import { requireRole } from "@/server/auth/guards";
import { listConversations } from "@/server/conversations/service";
import { ROUTES } from "@/routes";
import { USER_ROLE, USER_STATUS } from "@/constants";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const user = await requireRole(USER_ROLE.BUYER, USER_ROLE.SELLER);
  const conversations = await listConversations(user.id);

  return (
    <div className="container-page max-w-[900px] py-10">
      <p className="eyebrow">Inbox</p>
      <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink-900">Messages</h1>
      <p className="mt-1 text-[14px] text-ink-500">
        {conversations.length} conversation{conversations.length === 1 ? "" : "s"}
      </p>

      {conversations.length === 0 ? (
        <div className="card mt-8 grid place-items-center px-6 py-20 text-center">
          <p className="text-[16px] font-medium text-ink-900">No conversations yet</p>
          <p className="mt-1.5 max-w-[420px] text-[13.5px] text-ink-500">
            {user.role === USER_ROLE.BUYER
              ? "Contact a seller from any listing and the thread will appear here."
              : "Reach out to a buyer from the directory, or wait for a buyer to contact you about a listing."}
          </p>
          <Link
            href={user.role === USER_ROLE.BUYER ? "/assets" : "/sell/buyers"}
            className="mt-4 text-[13.5px] font-medium text-navy-700 hover:underline"
          >
            {user.role === USER_ROLE.BUYER ? "Browse listings" : "Browse buyers"}
          </Link>
        </div>
      ) : (
        <ul className="card mt-8 divide-y divide-ink-100">
          {conversations.map((conversation) => {
            const counterparty =
              conversation.buyerId === user.id ? conversation.seller : conversation.buyer;
            const counterpartyName =
              ("sellerProfile" in counterparty && counterparty.sellerProfile?.companyName) ||
              ("buyerProfile" in counterparty && counterparty.buyerProfile?.companyName) ||
              counterparty.fullName;
            const lastMessage = conversation.messages[0];
            const unread = lastMessage && lastMessage.senderId !== user.id && !lastMessage.readAt;

            return (
              <li key={conversation.id}>
                <Link
                  href={ROUTES.messages.thread(conversation.id)}
                  className="flex gap-4 px-5 py-4 transition-colors hover:bg-ink-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-semibold text-ink-900">
                        {counterpartyName}
                      </span>
                      {counterparty.status !== USER_STATUS.ACTIVE ? (
                        <Badge tone="caution">No longer active</Badge>
                      ) : null}
                      {unread ? <Badge tone="navy">New</Badge> : null}
                    </div>

                    <p className="mt-0.5 truncate text-[13.5px] text-ink-700">
                      {conversation.subject}
                    </p>

                    {lastMessage ? (
                      <p className="mt-1 line-clamp-1 text-[12.5px] text-ink-500">
                        {lastMessage.senderId === user.id ? "You: " : ""}
                        {lastMessage.body}
                      </p>
                    ) : null}

                    {conversation.asset ? (
                      <p className="mt-1.5 text-[12px] text-ink-300">
                        About #{conversation.asset.referenceCode} · {conversation.asset.title}
                      </p>
                    ) : null}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[12px] text-ink-500">
                      {formatRelative(conversation.lastMessageAt)}
                    </p>
                    <p className="tabular mt-1 text-[12px] text-ink-300">
                      {conversation._count.messages} message
                      {conversation._count.messages === 1 ? "" : "s"}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
