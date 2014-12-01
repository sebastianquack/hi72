class WelcomeController < ApplicationController

  before_action :set_locale
 
  def index
    @transparent = true
  end
  
  def open_call
  end

  def schedule
  end

  def teams
  end

  def mitmachen
  end

  def project_info
    @user = User.new
    @site = Site.new
    @posters = Poster.order('id DESC').all   
  end

  
  def set_locale
    if params[:locale]
      I18n.locale = params[:locale] 
      #elsif request.location.country_code == "DE"
      #I18n.locale = :de
    else
      I18n.locale = I18n.default_locale
    end
    
  end
  
end
