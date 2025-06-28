import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface varroa_treatmentsAttributes {
    treatment_id?: number;
    treatment_name: string;
}

@Table({
	tableName: "varroa_treatments",
	schema: "public",
	timestamps: false 
})
export class varroa_treatments extends Model<varroa_treatmentsAttributes, varroa_treatmentsAttributes> implements varroa_treatmentsAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('varroa_treatments_treatment_id_seq'::regclass)") 
    })
    	treatment_id?: number;

    @Column({
    	type: DataType.STRING(100) 
    })
    	treatment_name!: string;

}