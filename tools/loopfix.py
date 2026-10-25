"""Makes a legendary animation loop seamlessly (no temporal filters: a denoiser starts cold on frame 0 and would re-create a pop at the loop).
Output = original frames from X onward, with the last X frames blended (smoothstep) into frames 0..X-1, so the final
frame flows straight into the first. Then a light temporal denoise and an H.264 encode at the same size and frame rate.
Usage: python3 tools/loopfix.py in.mp4 out.mp4 [blend_frames=12]"""
import sys, subprocess, numpy as np
src, dst = sys.argv[1], sys.argv[2]; X = int(sys.argv[3]) if len(sys.argv) > 3 else 12
w, h = map(int, subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', src]).decode().strip().split(','))
fps = subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', src]).decode().strip()
raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'])
F = np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3).astype(np.float32)
n = len(F); out = []
for k in range(n - X):
    j = X + k; f = F[j]
    t = k - (n - 2 * X)                    # last X output frames blend toward the head
    if t >= 0:
        a = (t + 1) / (X + 1); a = a * a * (3 - 2 * a)
        f = F[j] * (1 - a) + F[t] * a
    out.append(np.clip(f + .5, 0, 255).astype(np.uint8))
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{w}x{h}', '-r', fps, '-i', '-',
                        '-vf', 'format=yuv420p', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-tune', 'film', '-x264-params', 'ipratio=1.0:pbratio=1.0',
                        '-movflags', '+faststart', dst], stdin=subprocess.PIPE)
enc.stdin.write(b''.join(o.tobytes() for o in out)); enc.stdin.close(); enc.wait()
print(f'{src} -> {dst}: {len(out)} frames')
