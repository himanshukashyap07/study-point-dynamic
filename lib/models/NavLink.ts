import mongoose, { Schema, Document, model, models } from 'mongoose';

// Content block — can be table, qa, list, or paragraph
export interface IContentBlock {
  _id?: string;
  type: 'table' | 'qa' | 'list' | 'paragraph' | 'image' | 'pdf' | 'video';
  title?: string;
  data?: object;
  text?: string;
  image?: string;
}

export interface ISubLink {
  _id?: string;
  slug: string;
  label: string;
  order: number;
  contentBlocks: IContentBlock[];
}

export interface IMidLink {
  _id?: string;
  slug: string;
  label: string;
  order: number;
  contentBlocks: IContentBlock[];
  subLinks: ISubLink[];
}

export interface INavLink extends Document {
  slug: string;
  label: string;
  order: number;
  contentBlocks: IContentBlock[];
  midLinks: IMidLink[];
}

const ContentBlockSchema = new Schema<IContentBlock>({
  type: { type: String, enum: ['table', 'qa', 'list', 'paragraph', 'image', 'pdf', 'video'], required: true },
  title: { type: String },
  image: { type: String },
  data: { type: Schema.Types.Mixed },
  text: { type: String },
});

const SubLinkSchema = new Schema<ISubLink>({
  slug: { type: String, required: true },
  label: { type: String, required: true },
  order: { type: Number, default: 0 },
  contentBlocks: [ContentBlockSchema],
});

const MidLinkSchema = new Schema<IMidLink>({
  slug: { type: String, required: true },
  label: { type: String, required: true },
  order: { type: Number, default: 0 },
  contentBlocks: [ContentBlockSchema],
  subLinks: [SubLinkSchema],
});

const NavLinkSchema = new Schema<INavLink>(
  {
    slug: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    order: { type: Number, default: 0 },
    contentBlocks: [ContentBlockSchema],
    midLinks: [MidLinkSchema],
  },
  { timestamps: true }
);

if (models.NavLink) {
  delete models.NavLink;
}
const NavLink = model<INavLink>('NavLink', NavLinkSchema);
export default NavLink;
