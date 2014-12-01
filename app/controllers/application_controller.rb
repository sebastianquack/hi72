class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception


  before_action :set_locale
  before_filter :export_i18n_messages

  def export_i18n_messages
    SimplesIdeias::I18n.export! if Rails.env.development?
  end

  # app/controllers/application_controller.rb
  def default_url_options(options={})
    logger.debug "default_url_options is passed options: #{options.inspect}\n"
    { locale: I18n.locale }
  end
 
  private
 
  def set_locale
    if params[:locale]
      I18n.locale = params[:locale] 
      #elsif request.location.country_code == "DE"
      #I18n.locale = :de
    else
      I18n.locale = I18n.default_locale
    end
  end
  
	def authenticate
    authenticate_or_request_with_http_basic do |username, password|
      username == Rails.configuration.admin_user && password == Rails.configuration.admin_password
    end
  end
  
end
