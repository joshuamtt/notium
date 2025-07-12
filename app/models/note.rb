class UserNote < ApplicationRecord
  validates :x, :y, presence: true
end
