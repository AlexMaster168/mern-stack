import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose'

const moduleSchema = new Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export type Module = InferSchemaType<typeof moduleSchema>
export type ModuleDocument = HydratedDocument<Module>
export const ModuleModel = model('Module', moduleSchema)
