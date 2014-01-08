class CreateSites < ActiveRecord::Migration
  def change
    create_table :sites do |t|
      t.text :description
      t.text :reason
      t.string :name
      t.string :email

      t.timestamps
    end
  end
end
