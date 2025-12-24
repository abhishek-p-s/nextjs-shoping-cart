import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts } from "@/lib/actions/product.action";

export const metadata = {
  title: "Home",
};

export default async function Home() {

  const latestProducts = await getLatestProducts()

  return (
    <div>
     <ProductList data={latestProducts} title="Featured Products" />
    </div>
  );
}
