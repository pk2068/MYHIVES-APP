import { Model, Table, Column, DataType, Index, Sequelize, ForeignKey } from 'sequelize-typescript';

export interface colony_health_statusesAttributes {
  status_id?: number;
  status_name: string;
}

@Table({
  tableName: 'colony_health_statuses',
  schema: 'public',
  timestamps: false,
})
export class Colony_health_statuses extends Model<colony_health_statusesAttributes, colony_health_statusesAttributes> implements colony_health_statusesAttributes {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    type: DataType.INTEGER,
    defaultValue: Sequelize.literal("nextval('colony_health_statuses_status_id_seq'::regclass)"),
  })
  status_id?: number;

  @Column({
    type: DataType.STRING(50),
  })
  status_name!: string;
}
