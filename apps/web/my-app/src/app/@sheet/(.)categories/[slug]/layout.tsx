// app/@sheet/(.)categories/[slug]/layout.tsx
export default function CategoryLayout({ children, nested }:{ 
  children: React.ReactNode; 
  nested: React.ReactNode; 
}) {
  return (
    <>
      {children}   {/* first sheet */}
      {nested}     {/* second sheet */}
    </>
  );
}
