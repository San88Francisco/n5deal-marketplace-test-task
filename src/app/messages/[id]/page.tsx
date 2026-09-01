import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { ReplyForm } from "@/components/messages/reply-form";
import { formatRelative } from "@/utils/format";
import { requireRole } from "@/server/auth/guards";
import { getConversation } from "@/server/conversations/service";
import { ROUTES } from "@/routes";
import { ASSET_STATUS, USER_ROLE, USER_STATUS } from "@/constants";

export const metadata: Metadata = { title: "Conversation" };

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireRole(USER_ROLE.BUYER, USER_ROLE.SELLER);
  const conversation = await getConversation(id, user.id);

  if (!conversation) notFound();

  const isBuyer = conversation.buyerId === user.id;
  const counterparty = isBuyer ? conversation.seller : conversation.buyer;
  const counterpartyName =
    ("sellerProfile" in counterparty && counterparty.sellerProfile?.companyName) ||
    ("buyerProfile" in counterparty && counterparty.buyerProfile?.companyName) ||
    counterparty.fullName;

  const readOnly = counterparty.status !== USER_STATUS.ACTIVE;

  return (
    <div className="container-page max-w-[760px] py-10">
      <Link href={ROUTES.messages.index} className="text-[13px] text-ink-500 hover:text-ink-900">
        ← Messages
      </Link>

      <header className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[22px] font-semibold tracking-tight text-ink-900">
            {counterpartyName}
          </h1>
          {readOnly && <Badge tone="caution">Participant no longer on the platform</Badge>}
        </div>
        <p className="mt-1 text-[14px] text-ink-700">{conversation.subject}</p>

        {conversation.asset && (
          <p className="mt-2 text-[13px] text-ink-500">
            About{" "}
            <Link
              href={ROUTES.assets.detail(conversation.asset.slug)}
              className="font-medium text-navy-700 hover:underline"
            >
              #{conversation.asset.referenceCode} {conversation.asset.title}
            </Link>
            {conversation.asset.status === ASSET_STATUS.SUSPENDED ? " (listing suspended)" : ""}
          </p>
        )}
      </header>

      <ol className="mt-8 space-y-4">
        {conversation.messages.map((message) => {
          const mine = message.senderId === user.id;
          return (
            <li key={message.id} className={mine ? "flex justify-end" : "flex justify-start"}>
              <div
                className={`max-w-[85%] rounded-card px-4 py-3 ${
                  mine
                    ? "bg-navy-900 text-white"
                    : "border border-ink-100 bg-white text-ink-900 shadow-card"
                }`}
              >
                <p className={`text-[12px] ${mine ? "text-ink-300" : "text-ink-500"}`}>
                  {mine ? "You" : message.sender.fullName} · {formatRelative(message.createdAt)}
                </p>
                <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed">
                  {message.body}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-8">
        {readOnly ? (
          <p className="rounded-card border border-ink-200 bg-ink-50 px-4 py-3 text-[13.5px] text-ink-500">
            This conversation is read-only because the other participant is suspended or has been
            removed from the platform.
          </p>
        ) : (
          <ReplyForm conversationId={conversation.id} />
        )}
      </div>
    </div>
  );
}
