import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface major_inspectionsAttributes {
    major_inspection_id?: string;
    location_id: string;
    inspection_date: string;
    general_notes?: string;
    created_at?: Date;
    updated_at?: Date;
}

@Table({
	tableName: "major_inspections",
	schema: "public",
	timestamps: false 
})
export class major_inspections extends Model<major_inspectionsAttributes, major_inspectionsAttributes> implements major_inspectionsAttributes {

    @Column({
    	primaryKey: true,
    	type: DataType.UUID,
    	defaultValue: Sequelize.literal("gen_random_uuid()") 
    })
    	major_inspection_id?: string;

    @Column({
    	type: DataType.UUID 
    })
    	location_id!: string;

    @Column({
    	type: DataType.STRING 
    })
    	inspection_date!: string;

    @Column({
    	allowNull: true,
    	type: DataType.STRING 
    })
    	general_notes?: string;

    @Column({
    	allowNull: true,
    	type: DataType.DATE,
    	defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") 
    })
    	created_at?: Date;

    @Column({
    	allowNull: true,
    	type: DataType.DATE,
    	defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") 
    })
    	updated_at?: Date;

}