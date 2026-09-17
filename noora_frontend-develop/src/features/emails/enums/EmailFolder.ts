import {
  FaBookmark,
  FaCircleCheck,
  FaDeleteLeft,
  FaInbox,
} from "react-icons/fa6";

enum EmailFolder {
	Inbox = "INBOX",
	Sent = "Sent Items",
	Drafts = "Drafts",
	Deleted = "Deleted Items",
}

const emailFolder = {
	[EmailFolder.Inbox]: { title: "دریافت", icon: FaInbox },
	[EmailFolder.Sent]: { title: "ارسال شده ها", icon: FaCircleCheck },
	[EmailFolder.Drafts]: { title: "پیش نوشته", icon: FaBookmark },
	[EmailFolder.Deleted]: { title: "حذف شده ها", icon: FaDeleteLeft },
};

export { EmailFolder, emailFolder };
