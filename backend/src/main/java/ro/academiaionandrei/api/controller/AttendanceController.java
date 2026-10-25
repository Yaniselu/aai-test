package ro.academiaionandrei.api.controller;

import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ro.academiaionandrei.api.dto.Dtos.AttendanceDto;
import ro.academiaionandrei.api.dto.Dtos.AttendanceRequest;
import ro.academiaionandrei.api.dto.Dtos.UserDto;
import ro.academiaionandrei.api.entity.User;
import ro.academiaionandrei.api.repository.UserRepository;
import ro.academiaionandrei.api.service.AttendanceService;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendance;
    private final UserRepository users;

    public AttendanceController(AttendanceService attendance, UserRepository users) {
        this.attendance = attendance;
        this.users = users;
    }

    /** Lista sportivilor aprobati, pentru catalogul antrenorului. */
    @GetMapping("/roster")
    @PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
    public List<UserDto> roster() {
        return attendance.roster();
    }

    /** Salveaza prezenta unei sedinte: acorda XP si actualizeaza Battle Pass-ul. */
    @PostMapping
    @PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
    public List<AttendanceDto> record(@Valid @RequestBody AttendanceRequest request) {
        User trainer = CurrentUser.require(users);
        return attendance.record(request, trainer.getId());
    }

    /** Istoricul propriu, afisat in profilul sportivului. */
    @GetMapping("/me")
    public List<AttendanceDto> mine() {
        return attendance.forUser(CurrentUser.require(users).getId());
    }
}
