module WelcomeHelper

  def absolute_attachment_url(attachment_name, attachment_style = :original)
    "#{request.protocol}#{request.host_with_port}#{attachment_name.url(attachment_style)}"
  end

end
