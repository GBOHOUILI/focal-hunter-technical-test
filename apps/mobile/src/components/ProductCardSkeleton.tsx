import { View, Animated, StyleSheet } from "react-native";
import { useEffect, useRef } from "react";

export function ProductCardSkeleton() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity,
        },
      ]}
    >
      <View style={styles.image} />

      <View style={styles.body}>
        <View style={styles.title} />

        <View style={styles.row}>
          <View style={styles.price} />
          <View style={styles.stock} />
        </View>

        <View style={styles.footer}>
          <View style={styles.store} />
          <View style={styles.arrow} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    maxWidth: "48%",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#D1D5DB",
  },

  body: {
    padding: 10,
  },

  title: {
    height: 16,
    width: "80%",
    borderRadius: 6,
    backgroundColor: "#D1D5DB",
  },

  row: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  price: {
    width: 70,
    height: 14,
    borderRadius: 6,
    backgroundColor: "#D1D5DB",
  },

  stock: {
    width: 30,
    height: 14,
    borderRadius: 6,
    backgroundColor: "#D1D5DB",
  },

  footer: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  store: {
    width: 80,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D1D5DB",
  },

  arrow: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#D1D5DB",
  },
});
