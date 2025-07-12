class UserNotesController < ApplicationController
  def index
    @user_notes = UserNote.all
  end
  
  def create
    @note = UserNote.create(usernote_params)
    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to usernotes_path }
    end
  end

  def update
    @note = UserNote.find(params[:id])
    @note.update(usernote_params)
    respond_to do |format|
      format.turbo_stream
      format.html { redirect_to usernotes_path }
    end
  end

  private
  def userenote_params
    params.require(:note).permit(:x, :y, :content)
  end
end


