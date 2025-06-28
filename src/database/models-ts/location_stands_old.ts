import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface location_stands_oldAttributes {
    id?: number;
    address: string;
    hive_count: number;
    user_id: number;
    created_at?: Date;
}

@Table({
	tableName: "location_stands_old",
	schema: "public",
	timestamps: false 
})
export class location_stands_old extends Model<location_stands_oldAttributes, location_stands_oldAttributes> implements location_stands_oldAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('location_stands_id_seq'::regclass)") 
    })
    	id?: number;

    @Column({
    	type: DataType.STRING(200) 
    })
    	address!: string;

    @Column({
    	type: DataType.INTEGER 
    })
    	hive_count!: number;

    @Column({
    	type: DataType.INTEGER 
    })
    	user_id!: number;

    @Column({
    	type: DataType.DATE(6),
    	defaultValue: Sequelize.literal("now()") 
    })
    	created_at?: Date;

}