const activityPrefixOrder = ["เดิน", "วิ่ง", "ปั่น"];

export function compareActivities(first: string, second: string) {
  const firstOrder = activityPrefixOrder.findIndex((prefix) => first.startsWith(prefix));
  const secondOrder = activityPrefixOrder.findIndex((prefix) => second.startsWith(prefix));
  const firstRank = firstOrder === -1 ? activityPrefixOrder.length : firstOrder;
  const secondRank = secondOrder === -1 ? activityPrefixOrder.length : secondOrder;

  return firstRank - secondRank || first.localeCompare(second, "th-TH");
}
