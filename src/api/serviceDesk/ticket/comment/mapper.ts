import { Attach, CommentVisibility, TicketComment } from "@/domain/serviceDesk";
import { ArrayMapper } from "@/shared/types";
import { ISODateString } from "@/shared/types/date";

export interface DbTicketComment {
  ticke_id: string;
  comment_no: string;

  body: string;
  owner_id: string;

  visibility: CommentVisibility;

  created_at: ISODateString;
  updated_at: ISODateString;
  active: boolean;

  files: Attach[];
  images: Attach[];
}

export const camelTicketCommentMapper: ArrayMapper<
  DbTicketComment,
  TicketComment
> = (data) => {
  return data.map((item) => ({
    ticketId: item.ticke_id,
    commentNo: item.comment_no,
    body: item.body,
    ownerId: item.owner_id,
    visibility: item.visibility,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    active: item.active,
    files: item.files,
    images: item.images,
  }));
};

export const snakeTicketCommentMapper: ArrayMapper<
  TicketComment,
  DbTicketComment
> = (data) => {
  return data.map((item) => ({
    ticke_id: item.ticketId,
    comment_no: item.commentNo,
    body: item.body,
    owner_id: item.ownerId,
    visibility: item.visibility,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    active: item.active,
    files: item.files,
    images: item.images,
  }));
};
