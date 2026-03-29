import { Schema, Document, model, models } from 'mongoose';
import { IContentBlock } from './NavLink';

export interface IPageContent extends Document {
  pageSlug: string; // e.g. 'home', 'about', 'contact'
  blocks: IContentBlock[];
}

const ContentBlockSchema = new Schema({
  type: { type: String, enum: ['table', 'qa', 'list', 'paragraph','image'], required: true },
  title: { type: String },
  image: { type: String },
  data: { type: Schema.Types.Mixed },
  text: { type: String },
});

const PageContentSchema = new Schema<IPageContent>(
  {
    pageSlug: { type: String, required: true, unique: true },
    blocks: [ContentBlockSchema],
  },
  { timestamps: true }
);

const PageContent = models.PageContent || model<IPageContent>('PageContent', PageContentSchema);
export default PageContent;
