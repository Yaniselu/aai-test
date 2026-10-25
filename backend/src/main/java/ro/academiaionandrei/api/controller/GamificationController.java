package ro.academiaionandrei.api.controller;

import org.springframework.web.bind.annotation.*;
import ro.academiaionandrei.api.dto.Dtos.BattlePassStateDto;
import ro.academiaionandrei.api.dto.Dtos.WheelSpinResultDto;
import ro.academiaionandrei.api.dto.Dtos.WheelStatusDto;
import ro.academiaionandrei.api.entity.User;
import ro.academiaionandrei.api.repository.UserRepository;
import ro.academiaionandrei.api.service.BattlePassService;
import ro.academiaionandrei.api.service.WheelService;

/** Battle Pass si roata norocului. */
@RestController
@RequestMapping("/api")
public class GamificationController {

    private final BattlePassService battlePass;
    private final WheelService wheel;
    private final UserRepository users;

    public GamificationController(BattlePassService battlePass, WheelService wheel, UserRepository users) {
        this.battlePass = battlePass;
        this.wheel = wheel;
        this.users = users;
    }

    // ------------------------------------------------------------ battle pass
    @GetMapping("/battlepass/me")
    public BattlePassStateDto myBattlePass() {
        return battlePass.stateFor(CurrentUser.require(users));
    }

    @PostMapping("/battlepass/claim/{rewardId}")
    public BattlePassStateDto claim(@PathVariable Long rewardId) {
        return battlePass.claim(CurrentUser.require(users), rewardId);
    }

    // ----------------------------------------------------------------- wheel
    @GetMapping("/wheel/status")
    public WheelStatusDto wheelStatus() {
        return wheel.status(CurrentUser.require(users));
    }

    @PostMapping("/wheel/spin")
    public WheelSpinResultDto spin() {
        User user = CurrentUser.require(users);
        WheelSpinResultDto result = wheel.spin(user);
        // Premiul poate acorda XP; persistam schimbarea de pe entitate.
        users.save(user);
        return result;
    }
}
