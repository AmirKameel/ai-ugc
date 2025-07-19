import { Header } from "./components/header";
import { ProductForm } from "./components/product-form";

export default function Home() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center px-6 py-16 md:p-20">
      <Header />
      <ProductForm />
    </div>
  );
}