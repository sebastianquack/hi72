class AddAttachmentImageToPosters < ActiveRecord::Migration
  def self.up
    change_table :posters do |t|
      t.attachment :image
    end
  end

  def self.down
    drop_attached_file :posters, :image
  end
end
