import { SideNav } from "@/components/layout/side-nav";

export default function CommunityLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="wrap grid items-start gap-7 pt-4 pb-[100px] md:grid-cols-[200px_minmax(0,1fr)] md:pt-6 md:pb-24 wide:grid-cols-[212px_minmax(0,1fr)_304px]">
      <SideNav />
      {children}
    </div>
  );
}
