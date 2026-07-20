import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Heart, Store, ArrowRight, Eye, Package } from "lucide-react-native";
import type { ProductListItem } from "../api/client";

interface Props {
  product: ProductListItem;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: Props) {
  const isOutOfStock = product.stock === 0;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.imageUrl }} style={styles.image} />

        <View
          style={[
            styles.badge,
            isOutOfStock && styles.badgeOutOfStock,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              isOutOfStock && styles.badgeTextOutOfStock,
            ]}
          >
            {isOutOfStock ? "Rupture" : "Disponible"}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.price}>
            {product.price.toLocaleString()} {product.currency}
          </Text>

          <View style={styles.iconText}>
            <Package size={12} color="#52c41a" />
            <Text style={styles.iconLabel}>{product.stock}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.store}>
            <Store size={12} color="#777" />
            <Text style={styles.storeName} numberOfLines={1}>
              {product.storeName}
            </Text>
          </View>

          <ArrowRight size={14} color="#999" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    maxWidth: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ececec",
  },

  imageContainer: {
    position: "relative",
  },

  image: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#f5f5f5",
  },

  body: {
    padding: 10,
  },

  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    minHeight: 12,
  },

  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },

  badge: {
    position: "absolute",
    top: 8,
    right: 8,

    minWidth: 72,
    height: 28,

    paddingHorizontal: 10,

    backgroundColor: "#E8F8EE",

    borderRadius: 14,

    justifyContent: "center",
    alignItems: "center",

    elevation: 3,
  },

  badgeOutOfStock: {
    backgroundColor: "#FDECEC",
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1B8A4B",
  },

  badgeTextOutOfStock: {
    color: "#D32F2F",
  },

  iconText: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,

  },

  iconLabel: {
    marginLeft: 3,
    fontSize: 11,
    color: "#777",
  },

  footer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  store: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  storeName: {
    marginLeft: 4,
    fontSize: 11,
    color: "#666",
    flexShrink: 1,
  },
});
