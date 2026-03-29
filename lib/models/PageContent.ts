import { Schema, Document, model, models, Types } from 'mongoose';
import { IContentBlock } from './NavLink';

export interface IPageContent extends Document {
  pageSlug: string;
  blocks: Types.DocumentArray<IContentBlock & Document>;
}

const ContentBlockSchema = new Schema({
  type: { type: String, enum: ['table', 'qa', 'list', 'paragraph', 'image', 'pdf', 'video'], required: true },
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

if (models.PageContent) {
  delete models.PageContent;
}
const PageContent = model<IPageContent>('PageContent', PageContentSchema);
export default PageContent;
