import { model, Model, Schema, Document, Query } from "mongoose";
import mongoose from 'mongoose';

interface IFile {
    name: string;
    size: number;
    owner: string;
    status: string;
    uploadDate: Date;
    fileLocation: string
};

const FileSchema: Schema = new Schema<IFile>({
    name: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true,
    },
    owner: {
        type: String,
        required: true,
        default: "Public"
    },
    uploadDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    fileLocation: {
        type: String,
        required: true,
    }

});

interface IFileHelpers extends Model<IFile> {
    byUser(username: string): Query<any, Document<IFile>> & IFileHelpers;
    byId(id: string): Query<any, Document<IFile>> & IFileHelpers;
}

FileSchema.query.byUser = function (username: string): Query<any, Document<IFile>> & IFileHelpers {
    return this.find({ owner: username });
}

FileSchema.query.byId = function (id: string): Query<any, Document<IFile>> & IFileHelpers {
    return this.findOne({ _id: id });
}


const FileModel = model<IFile, Model<IFile, IFileHelpers>>('File', FileSchema);

export { FileModel, IFile };