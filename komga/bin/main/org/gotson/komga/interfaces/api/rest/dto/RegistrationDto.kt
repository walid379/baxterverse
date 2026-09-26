package org.gotson.komga.interfaces.api.rest.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class RegistrationDto(
  @get:Email(regexp = ".+@.+\\..+")
  @get:NotBlank
  val email: String,

  @get:NotBlank
  @get:Size(min = 8, max = 128)
  val password: String,
)