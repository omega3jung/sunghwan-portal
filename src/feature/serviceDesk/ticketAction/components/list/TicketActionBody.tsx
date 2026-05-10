type TicketActionBodyProps = {
  content: string;
};

export function TicketActionBody({ content }: TicketActionBodyProps) {
  return (
    <div className="max-w-full overflow-x-auto">
      <div
        className="prose prose-sm min-w-0 max-w-none break-words text-foreground prose-a:text-primary prose-img:max-w-full prose-img:rounded-lg prose-p:my-3 prose-p:leading-7 prose-pre:max-w-full prose-pre:overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: content || "<p>-</p>" }}
      />
    </div>
  );
}
