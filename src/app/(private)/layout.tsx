import Link from "next/link";
import SidebarItem from "@/components/routes/home/sidebar-item";
import { UserType } from "@/lib/constants/user-type";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LocationAlert from "@/components/location-alert";

const navigationItems = [
  {
    name: "Home",
    href: "/home",
    icon: "House",
  },
  {
    name: "Coletas",
    href: "/coletas",
    icon: "Recycle",
  },
  {
    name: "Perfil",
    href: "/perfil",
    icon: "User",
  },
];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    return redirect("/");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <LocationAlert />
      <main className="flex-grow">{children}</main>
      <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200">
        <div className="flex justify-around py-2">
          {navigationItems.map((item) => {
            return (
              <SidebarItem
                key={item.href}
                href={item.href}
                label={item.name}
                icon={item.icon}
              />
            );
          })}
        </div>
      </nav>
    </div>
  );
}
