type TicketActionBodyProps = {
  content: string;
};

export function TicketActionBody({ content }: TicketActionBodyProps) {
  return (
    <div
      className="prose prose-sm max-w-none break-words text-foreground prose-p:my-3 prose-p:leading-7 prose-a:text-primary prose-img:rounded-lg"
      dangerouslySetInnerHTML={{ __html: content || "<p>-</p>" }}
    />
  );
}
