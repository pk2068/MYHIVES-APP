import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface queen_statusesAttributes {
    status_id?: number;
    status_name: string;
}

@Table({
	tableName: "queen_statuses",
	schema: "public",
	timestamps: false 
})
export class queen_statuses extends Model<queen_statusesAttributes, queen_statusesAttributes> implements queen_statusesAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('queen_statuses_status_id_seq'::regclass)") 
    })
    	status_id?: number;

    @Column({
    	type: DataType.STRING(50) 
    })
    	status_name!: string;

}