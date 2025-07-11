import {
	Model, Table, Column, DataType, Index, Sequelize, ForeignKey,  BelongsTo
} from "sequelize-typescript";
import { users } from './users'; // Assuming path to users model


export interface locationsAttributes {
    location_id?: string;
    user_id: string;
    name: string;
    address?: string;
    latitude?: string;
    longitude?: string;
    country?: string;
    notes?: string;
    created_at?: Date;
    updated_at?: Date;
}

@Table({
	tableName: "locations",
	schema: "public",
	timestamps: false 
})
export class locations extends Model<locationsAttributes, locationsAttributes> implements locationsAttributes {

    @Column({
    	primaryKey: true,
    	type: DataType.UUID,
    	defaultValue: Sequelize.literal("gen_random_uuid()") 
    })
    	location_id?: string;

	@ForeignKey(() => users)
    @Column({
    	type: DataType.UUID 
    })
    	user_id!: string;

    @Column({
    	type: DataType.STRING(255) 
    })
    	name!: string;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(500) 
    })
    	address?: string;

    @Column({
    	allowNull: true,
    	type: DataType.DECIMAL(9,6) 
    })
    	latitude?: string;

    @Column({
    	allowNull: true,
    	type: DataType.DECIMAL(9,6) 
    })
    	longitude?: string;

    @Column({
    	allowNull: true,
    	type: DataType.STRING(100) 
    })
    	country?: string;

    @Column({
    	allowNull: true,
    	type: DataType.STRING 
    })
    	notes?: string;

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

	// Association with users model

    @BelongsTo(() => users)
    user?: users; // This property would hold the associated user object

}