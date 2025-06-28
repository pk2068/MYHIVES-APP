import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey 
} from "sequelize-typescript";

export interface usersoldAttributes {
    id?: number;
    name: string;
    email: string;
    born_date: string;
    created_at?: Date;
}

@Table({
	tableName: "usersold",
	schema: "public",
	timestamps: false 
})
export class usersold extends Model<usersoldAttributes, usersoldAttributes> implements usersoldAttributes {

    @Column({
    	primaryKey: true,
    	autoIncrement: true,
    	type: DataType.INTEGER,
    	defaultValue: Sequelize.literal("nextval('users_id_seq'::regclass)") 
    })
    	id?: number;

    @Column({
    	type: DataType.STRING(100) 
    })
    	name!: string;

    @Column({
    	type: DataType.STRING(100) 
    })
    	email!: string;

    @Column({
    	type: DataType.STRING 
    })
    	born_date!: string;

    @Column({
    	type: DataType.DATE(6),
    	defaultValue: Sequelize.literal("now()") 
    })
    	created_at?: Date;

}