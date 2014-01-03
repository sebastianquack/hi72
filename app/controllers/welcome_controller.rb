class WelcomeController < ApplicationController

  def index
    @posters = Poster.all
  end


end
