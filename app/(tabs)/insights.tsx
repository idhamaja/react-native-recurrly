import ListHeading from "@/components/ListHeading";
import "@/global.css";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { usePostHog } from "posthog-react-native";
import { useMemo } from "react";
import { FlatList, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { useSubscriptionStore } from "../lib/subscriptionStore";
import { formatCurrency } from "../lib/utils";

/**
 * Styled SafeAreaView (hanya dideklarasikan SEKALI)
 */
const SafeAreaView = styled(RNSafeAreaView);

/**
 * Component kecil untuk card statistik
 */
const StatCard = ({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) => {
  return (
    <View className="auth-card mr-3 w-44">
      <Text className="text-sm font-sans-semibold text-muted-foreground">
        {title}
      </Text>

      <Text className="text-xl font-sans-bold text-primary mt-2">{value}</Text>

      {subtitle && (
        <Text className="text-xs text-muted-foreground mt-1">{subtitle}</Text>
      )}
    </View>
  );
};

/**
 * Main Screen: Insights
 */
export default function Insights() {
  const posthog = usePostHog();
  const { subscriptions } = useSubscriptionStore();

  const now = dayjs();

  /**
   * HITUNG SEMUA DATA STATISTIK
   */
  const stats = useMemo(() => {
    // Total subscription
    const total = subscriptions.length;

    // Hitung berdasarkan status
    const counts = subscriptions.reduce(
      (acc, s) => {
        const key = s.status ?? "unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Total bulanan
    const monthlySum = subscriptions
      .filter((s) => s.frequency === "Monthly")
      .reduce((sum, s) => sum + (s.price || 0), 0);

    // Total tahunan
    const yearlySum = subscriptions
      .filter((s) => s.frequency === "Yearly")
      .reduce((sum, s) => sum + (s.price || 0), 0);

    // Konversi ke bulanan
    const monthlyEquivalent = monthlySum + yearlySum / 12;

    // Pengeluaran per kategori
    const byCategory = subscriptions.reduce(
      (acc, s) => {
        const key = s.category || "Other";
        acc[key] = (acc[key] || 0) + (s.price || 0);
        return acc;
      },
      {} as Record<string, number>,
    );

    // Subscription yang akan datang dalam 30 hari
    const upcomingCount = subscriptions.filter(
      (s) =>
        s.renewalDate &&
        dayjs(s.renewalDate).isAfter(now) &&
        dayjs(s.renewalDate).isBefore(now.add(30, "day")),
    ).length;

    return {
      total,
      counts,
      monthlySum,
      yearlySum,
      monthlyEquivalent,
      byCategory,
      upcomingCount,
    };
  }, [subscriptions]);

  /**
   * Ambil Top 6 kategori terbesar
   */
  const categories = useMemo(() => {
    return Object.entries(stats.byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [stats.byCategory]);

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      {/* Title */}
      <Text className="text-3xl font-sans-bold text-primary mb-6">
        Insights
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ================= SUMMARY ================= */}
        <ListHeading title="Summary" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-5"
        >
          <StatCard title="Total Subscriptions" value={`${stats.total}`} />

          <StatCard
            title="Monthly Spend"
            value={formatCurrency(stats.monthlyEquivalent)}
            subtitle={`(${formatCurrency(stats.monthlySum)} + yearly/12)`}
          />

          <StatCard
            title="Yearly Spend"
            value={formatCurrency(stats.yearlySum)}
          />

          <StatCard title="Upcoming (30d)" value={`${stats.upcomingCount}`} />
        </ScrollView>

        {/* ================= STATUS ================= */}
        <ListHeading title="Status Breakdown" />

        <View className="auth-card mb-5">
          {Object.entries(stats.counts).map(([status, count]) => (
            <View key={status} className="flex-row justify-between py-2">
              <Text className="text-sm font-sans-medium text-muted-foreground">
                {status}
              </Text>

              <Text className="text-sm font-sans-medium text-primary">
                {count}
              </Text>
            </View>
          ))}
        </View>

        {/* ================= CATEGORY ================= */}
        <ListHeading title="Top Categories" />

        <View className="auth-card mb-5">
          {categories.length === 0 ? (
            <Text className="home-empty-state">No categories yet</Text>
          ) : (
            <FlatList
              data={categories}
              keyExtractor={([name]) => name}
              renderItem={({ item: [name, value] }) => {
                const total =
                  Object.values(stats.byCategory).reduce((a, b) => a + b, 0) ||
                  1;

                const pct = Math.round((value / total) * 100);

                return (
                  <View className="mb-3">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm font-sans-medium text-primary">
                        {name}
                      </Text>

                      <Text className="text-sm font-sans-medium text-muted-foreground">
                        {formatCurrency(value)} • {pct}%
                      </Text>
                    </View>

                    {/* Progress bar */}
                    <View className="h-2 bg-muted rounded-full mt-2 overflow-hidden">
                      <View
                        style={{ width: `${pct}%` }}
                        className="h-2 bg-primary"
                      />
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>

        {/* ================= RENEWALS ================= */}
        <ListHeading title="Recent Renewals" />

        <View className="auth-card mb-28">
          {subscriptions.length === 0 ? (
            <Text className="home-empty-state">No subscriptions yet</Text>
          ) : (
            subscriptions
              .slice()
              .sort(
                (a, b) =>
                  (a.renewalDate ? new Date(a.renewalDate).getTime() : 0) -
                  (b.renewalDate ? new Date(b.renewalDate).getTime() : 0),
              )
              .slice(0, 6)
              .map((s) => (
                <View key={s.id} className="flex-row justify-between py-2">
                  <Text className="text-sm font-sans-medium text-primary">
                    {s.name}
                  </Text>

                  <Text className="text-sm font-sans-medium text-muted-foreground">
                    {s.renewalDate ? dayjs(s.renewalDate).format("MMM D") : "—"}
                  </Text>
                </View>
              ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
