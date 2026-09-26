package org.gotson.komga.interfaces.api.rest

import jakarta.validation.Valid
import org.gotson.komga.domain.model.KomgaUser
import org.gotson.komga.domain.model.UserEmailAlreadyExistsException
import org.gotson.komga.domain.service.KomgaUserLifecycle
import org.gotson.komga.interfaces.api.rest.dto.RegistrationDto
import org.gotson.komga.interfaces.api.rest.dto.UserDto
import org.gotson.komga.interfaces.api.rest.dto.toDto
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping(
  "api/v1/register",
  produces = [MediaType.APPLICATION_JSON_VALUE],
)
class RegistrationController(
  private val userLifecycle: KomgaUserLifecycle,
) {

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  fun register(
    @Valid
    @RequestBody
    registration: RegistrationDto,
  ): UserDto {
    if (userLifecycle.countUsers() == 0L) {
      throw ResponseStatusException(
        HttpStatus.CONFLICT,
        "The server must be claimed before registration",
      )
    }

    return try {
      userLifecycle
        .createUser(
          KomgaUser(
            email = registration.email.trim().lowercase(),
            password = registration.password,
          ),
        )
        .toDto()
    } catch (_: UserEmailAlreadyExistsException) {
      throw ResponseStatusException(
        HttpStatus.CONFLICT,
        "An account with this email already exists",
      )
    }
  }
}