class WelcomeController < ApplicationController

  before_action :set_locale
 
  def index
    @posters = Poster.order('created_at DESC').all   
  end
  
  def set_locale
    I18n.locale = params[:locale] || I18n.default_locale
  end
  
end
