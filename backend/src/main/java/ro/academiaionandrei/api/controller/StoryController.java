package ro.academiaionandrei.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ro.academiaionandrei.api.dto.Dtos.StoryDto;
import ro.academiaionandrei.api.repository.UserRepository;
import ro.academiaionandrei.api.service.StoryService;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
public class StoryController {

    private final StoryService stories;
    private final UserRepository users;

    public StoryController(StoryService stories, UserRepository users) {
        this.stories = stories;
        this.users = users;
    }

    @GetMapping
    public List<StoryDto> active() {
        return stories.active();
    }

    @PostMapping(consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public StoryDto upload(@RequestParam("file") MultipartFile file,
                           @RequestParam(value = "caption", required = false) String caption) {
        return stories.upload(CurrentUser.require(users), file, caption);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        stories.delete(CurrentUser.require(users), id);
    }
}
