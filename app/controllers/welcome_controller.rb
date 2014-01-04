class WelcomeController < ApplicationController

  def index
    @posters = Poster.order('created_at DESC').all
    
  end


end
