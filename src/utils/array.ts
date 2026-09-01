export function groupBy<T, K extends string>(items: T[], key: (item: T) => K): Record<K, T[]> {
  return items.reduce(
    (groups, item) => {
      const group = key(item);
      groups[group] = groups[group] ? [...groups[group], item] : [item];
      return groups;
    },
    {} as Record<K, T[]>,
  );
}
