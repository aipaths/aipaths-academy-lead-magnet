"""Camera tracking + solve for a handheld clip, from a script, in the user's live Blender.

Run inside Blender (paste into execute_blender_code), in steps:
  1. edit CONFIG, run the file once -> loads the clip, opens a Clip Editor, tracks everything
  2. call exclude_box(...) for refractive/moving objects, then clean_and_solve()
  3. call focal_sweep() and set the best focal, then clean_and_solve() again
Prints coverage (live points per frame) and re-projection error at every stage.
"""
import bpy

# ---- CONFIG -------------------------------------------------------------
FIRST_FRAME = "/abs/path/referencias/clip_frames/v_0001.jpg"
SENSOR_MM = 36.0           # applies to the clip WIDTH (short side for vertical video)
FOCAL_MM = 60.0            # iPhone 1x with stabilisation, vertical 1080x1920: ~59.5
SEED_EVERY = 20            # detect new features every N frames
MIN_ALIVE = 25             # never let a cleanup drop a frame below this many points
# -------------------------------------------------------------------------

sc = bpy.context.scene


def clip_ctx():
    area = next(a for a in bpy.context.screen.areas if a.type == "CLIP_EDITOR")
    region = next(r for r in area.regions if r.type == "WINDOW")
    return dict(area=area, region=region, space_data=area.spaces.active)


def goto(f):
    # frame_set alone does NOT move the clip editor (no redraw from scripts):
    # markers would be created on the old frame.
    sc.frame_set(f)
    clip_ctx()["space_data"].clip_user.frame_current = f


def setup():
    clip = bpy.data.movieclips.load(FIRST_FRAME)
    sc.active_clip = clip
    sc.frame_start, sc.frame_end = 1, clip.frame_duration
    sc.render.resolution_x, sc.render.resolution_y = clip.size[0], clip.size[1]
    clip.tracking.camera.sensor_width = SENSOR_MM
    clip.tracking.camera.focal_length = FOCAL_MM
    area = next(a for a in bpy.context.screen.areas if a.type == "VIEW_3D")
    area.type = "CLIP_EDITOR"          # the user watches the tracking live here
    sp = area.spaces.active
    sp.clip, sp.mode, sp.view = clip, "TRACKING", "CLIP"
    ts = clip.tracking.settings
    ts.default_pattern_size, ts.default_search_size = 41, 201
    ts.default_motion_model, ts.default_pattern_match = "LocRotScale", "PREV_FRAME"
    ts.default_correlation_min, ts.default_margin = 0.85, 25
    return clip


def alive_per_frame(trk):
    cnt = {f: 0 for f in range(sc.frame_start, sc.frame_end + 1)}
    for t in trk.tracks:
        for m in t.markers:
            if not m.mute and m.frame in cnt:
                cnt[m.frame] += 1
    return cnt


def track_all(clip):
    trk, ov = clip.tracking, clip_ctx()
    w, h = clip.size
    frames = list(range(sc.frame_start, sc.frame_end + 1, SEED_EVERY)) + [sc.frame_end]
    for f in frames:
        goto(f)
        before = {t.name for t in trk.tracks}
        live = [m.co[:] for t in trk.tracks if (m := t.markers.find_frame(f)) and not m.mute]
        with bpy.context.temp_override(**ov):
            bpy.ops.clip.select_all(action="DESELECT")
            bpy.ops.clip.detect_features(placement="FRAME", margin=50, threshold=0.04, min_distance=120)
        dup = []
        for t in trk.tracks:
            if t.name in before:
                continue
            c = t.markers.find_frame(f).co
            t.select = all(((c[0] - l[0]) * w) ** 2 + ((c[1] - l[1]) * h) ** 2 > 60 ** 2 for l in live)
            if not t.select:
                dup.append(t.name)
        with bpy.context.temp_override(**ov):
            bpy.ops.clip.track_markers(backwards=False, sequence=True)
        goto(f)
        with bpy.context.temp_override(**ov):
            bpy.ops.clip.track_markers(backwards=True, sequence=True)
            for t in trk.tracks:
                t.select = t.name in dup
            if dup:
                bpy.ops.clip.delete_track(confirm=False)
    with bpy.context.temp_override(**ov):
        bpy.ops.clip.select_all(action="SELECT")
        bpy.ops.clip.clean_tracks(frames=30, error=0.0, action="DELETE_TRACK")
    cov = alive_per_frame(trk)
    print("tracks", len(trk.tracks), "min alive/frame", min(cov.values()))


def delete(trk, tracks):
    for t in trk.tracks:
        t.select = t in tracks
    if tracks:
        with bpy.context.temp_override(**clip_ctx()):
            bpy.ops.clip.delete_track(confirm=False)


def exclude_box(keyframes, margin=45, share=0.2):
    """Drop tracks living >share of their life inside an object's box (glass, screens).
    keyframes: [(frame, (x0, y0, x1, y1)), ...] in pixels, top-left origin, sorted."""
    clip = sc.active_clip
    w, h = clip.size

    def box(f):
        for (f0, b0), (f1, b1) in zip(keyframes, keyframes[1:]):
            if f0 <= f <= f1:
                a = (f - f0) / max(1, f1 - f0)
                return [b0[i] + (b1[i] - b0[i]) * a for i in range(4)]
        return keyframes[0][1] if f < keyframes[0][0] else keyframes[-1][1]

    kill = []
    for t in clip.tracking.tracks:
        ms = [m for m in t.markers if not m.mute]
        inside = 0
        for m in ms:
            x, y, b = m.co[0] * w, (1 - m.co[1]) * h, box(m.frame)
            inside += b[0] - margin < x < b[2] + margin and b[1] - margin < y < b[3] + margin
        if ms and inside / len(ms) > share:
            kill.append(t)
    delete(clip.tracking, kill)
    print("excluded", len(kill))


def solve():
    with bpy.context.temp_override(**clip_ctx()):
        bpy.ops.clip.solve_camera()
    rec = sc.active_clip.tracking.reconstruction
    return round(rec.average_error, 3), len(rec.cameras)


def clean_and_solve(rounds=6):
    trk = sc.active_clip.tracking
    ts = trk.settings
    ts.use_keyframe_selection = True
    ts.refine_intrinsics_radial_distortion = False   # overfits with few points
    print("solve", solve())
    for _ in range(rounds):
        errs = sorted(t.average_error for t in trk.tracks if t.has_bundle)
        th = max(1.0, errs[len(errs) // 2] * 2.5)
        cov, kill = alive_per_frame(trk), []
        for t in sorted((t for t in trk.tracks if t.has_bundle), key=lambda t: -t.average_error):
            if t.average_error <= th:
                break
            frs = [m.frame for m in t.markers if not m.mute and m.frame in cov]
            if all(cov[f] - 1 >= MIN_ALIVE for f in frs):   # protect coverage
                kill.append(t)
                for f in frs:
                    cov[f] -= 1
        kill += [t for t in trk.tracks if not t.has_bundle]
        if not kill:
            break
        delete(trk, kill)
        print("dropped", len(kill), "solve", solve())


def focal_sweep(values=(34, 40, 46, 52, 58, 64, 70, 78)):
    cam = sc.active_clip.tracking.camera
    res = []
    for f in values:
        cam.focal_length = f
        res.append((f,) + solve())
    print(res)
    return min(res, key=lambda r: r[1])


track_all(setup())
