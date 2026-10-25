package ro.academiaionandrei.api.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import ro.academiaionandrei.api.dto.Dtos.CompetitionDto;
import ro.academiaionandrei.api.dto.Dtos.CompetitionRequest;
import ro.academiaionandrei.api.entity.Competition;
import ro.academiaionandrei.api.exception.NotFoundException;
import ro.academiaionandrei.api.repository.CompetitionRepository;
import ro.academiaionandrei.api.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/competitions")
public class CompetitionController {

    private final CompetitionRepository competitions;
    private final UserRepository users;

    public CompetitionController(CompetitionRepository competitions, UserRepository users) {
        this.competitions = competitions;
        this.users = users;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<CompetitionDto> list() {
        return competitions.findAllWithDetails().stream().map(CompetitionDto::from).toList();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public CompetitionDto create(@Valid @RequestBody CompetitionRequest request) {
        Competition competition = new Competition();
        competition.setTitle(request.title().trim());
        competition.setLocation(request.location().trim());
        competition.setDate(request.date());
        competition.setDescription(request.description());
        competition.setCreatedBy(CurrentUser.require(users));

        return CompetitionDto.from(competitions.save(competition));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!competitions.existsById(id)) {
            throw new NotFoundException("Competitia nu exista.");
        }
        competitions.deleteById(id);
    }
}
