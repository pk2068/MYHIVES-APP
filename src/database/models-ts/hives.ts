import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface hivesAttributes {
    hive_id?: string;
    location_id: string;
    hive_name: string;
    description?: string;
    is_active?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

@Table({
	tableName: "hives",
	schema: "public",
	timestamps: false 
})
export class hives extends Model<hivesAttributes, hivesAttributes> implements hivesAttributes {

    @Column({
    	primaryKey: true,
    	type: DataType.UUID,
    	defaultValue: Sequelize.literal("gen_random_uuid()") 
    })
    	hive_id?: string;

    @Column({
    	type: DataType.UUID 
    })
    	location_id!: string;

    @Column({
    	type: DataType.STRING(255) 
    })
    	hive_name!: string;

    @Column({
    	allowNull: true,
    	type: DataType.STRING 
    })
    	description?: string;

    @Column({
    	allowNull: true,
    	type: DataType.BOOLEAN,
    	defaultValue: Sequelize.literal("true") 
    })
    	is_active?: boolean;

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