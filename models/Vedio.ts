import mongoose,{Schema, model, models} from "mongoose";

export const VEDIO_DIMENSIONS = {
    width: 1080,
    height:1920
} as const;

export interface IVedio {
    _id?: mongoose.Types.ObjectId
    title: string;
    description: string;
    vedioUrl: string;
    thumbnailUrl: string;
    controls?: boolean;
    transformation?: {
        height: number;
        width: number;
        quality?: number;
    };
}

const vedioSchema = new Schema<IVedio>(
    {
        title:{type: string,required:true},
        description:{type: string,required:true},
        vedioUrl:{type: string,required:true},
        thumbnailUrl:{type: string,required:true},
        controls:{type: Boolean, default:true},
        transformation:{
            height:{type: Number,default:VEDIO_DIMENSIONS.height},
            width:{type: Number,default:VEDIO_DIMENSIONS.width},
            quality:{type: Number, min:1,max:100},
        },
    },
    {
        timestamps:true
    }
);

const Vedio =models?.Vedio || model<IVedio>("Vedio", vedioSchema);

export default Vedio;