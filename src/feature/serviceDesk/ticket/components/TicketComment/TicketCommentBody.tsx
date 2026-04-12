type TicketCommentBodyProps = {
  body?: string;
};

export function TicketCommentBody({ body }: TicketCommentBodyProps) {
  return (
    <div
      className="prose prose-sm max-w-none break-words text-foreground prose-p:my-2 prose-p:leading-7 prose-a:text-primary prose-img:my-3 prose-img:max-h-64 prose-img:rounded-lg"
      dangerouslySetInnerHTML={{
        __html: body || "<p>-</p>",
      }}
    />
  );
}
