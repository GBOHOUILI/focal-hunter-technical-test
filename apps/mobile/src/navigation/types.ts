// Every screen in the app, and what data it needs to render.
// undefined means "this screen takes no parameters".
export type RootStackParamList = {
  ProductList: undefined;
  ProductDetail: { productId: string };
};
