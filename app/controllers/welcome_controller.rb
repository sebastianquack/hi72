class WelcomeController < ApplicationController

  def poster_submit
    File.open("#{Rails.root}/public/uploads/somefilename.png", 'wb') do |f|
      f.write(params[:image].read)
    end
    render json: "1"
  end

end
