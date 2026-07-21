type ExcelExportLinkProps = {
  report: "age" | "amp" | "club";
  className: string;
};

export function ExcelExportLink({ report, className }: ExcelExportLinkProps) {
  return (
    <a className={className} href={`/api/export/${report}`}>
      ส่งออก Excel
    </a>
  );
}
