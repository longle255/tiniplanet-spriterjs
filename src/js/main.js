'use strict';
/**
 * @return {void}
 */
var setupCanvas = function(scml, canvas, link) {
	var canvas_div = document.getElementById(canvas).appendChild(document.createElement('div'));
	canvas_div.style.display = 'inline-block';

	var canvas_w = jQuery('#' + canvas).width();
	var canvas_h = jQuery('#' + canvas).height();

	var camera_x = 0;
	var camera_y = 0;
	var camera_angle = 0;
	var camera_scale = 0.5;

	var set_camera = function(pose) {
		var extent = get_pose_extent(pose);
		for (var i = 0, ict = pose.getNumAnims(); i < ict; ++i) {
			pose.setAnim(i);
			/* 
			// get extent for each millisecond 
			for (var t = 0, tct = pose.getAnimLength(); t < tct; ++t)
			{
				pose.setTime(t);
				extent = get_pose_extent(pose, extent);
			}
			*/
			// get extent for each keyframe
			for (var k = 0, kct = pose.getNumAnimKeys(); k < kct; ++k) {
				pose.setKey(k);
				extent = get_pose_extent(pose, extent);
			}
		}
		pose.setAnim(0);
		camera_x = (extent.max.x + extent.min.x) / 2;
		camera_y = (extent.max.y + extent.min.y) / 2;
		var scale_x = canvas_w / (extent.max.x - extent.min.x);
		var scale_y = canvas_h / (extent.max.y - extent.min.y);
		camera_scale = 1 / Math.min(scale_x, scale_y);
		camera_scale *= 0.9;
	}


	var pose = new spriter.pose();

	var url = scml;
	// var url = "/images/play-btn/play-btn.scml";

	var data = new spriter.data();
	data.loadFromURL(url, function() {
		pose = new spriter.pose(data);
		set_camera(pose);
	});



	canvas_div.addEventListener('drop', function(e) {
			e.preventDefault();

			var items = e.dataTransfer.items;
			for (var i = 0, ct = items.length; i < ct; ++i) {
				var entry = items[i].webkitGetAsEntry();
				if (!entry.isFile) {
					continue;
				}
				var ext = entry.name.split('.').pop();
				if (ext.toLowerCase() != 'scml') {
					continue;
				}

				var data = new spriter.data();
				data.loadFromFileEntry(entry, (function(data) {
					return function() {
						pose = new spriter.pose(data);
						set_camera(pose);
					}
				})(data));

				break;
			}
		},
		false);

	var cursor_x = 0;
	var cursor_y = 0;
	var cursor_down = false;
	var cursor_down_x = 0;
	var cursor_down_y = 0;

	canvas_div.addEventListener('mousedown', function(e) {
			cursor_down = true;
			cursor_down_x = e.offsetX;
			cursor_down_y = e.offsetY;
			pose.setAnim('onclick');
			window.location.href = link
		},
		false);
	canvas_div.addEventListener('mouseup', function(e) {
			cursor_down = false;
			pose.setAnim('normal');
		},
		false);
	canvas_div.addEventListener('mouseover', function(e) {
		pose.setAnim('hover');
	}, false);
	canvas_div.addEventListener('mouseout', function(e) {
		pose.setAnim('normal');
	}, false);
	canvas_div.addEventListener('mousemove', function(e) {

			cursor_x = e.offsetX;
			cursor_y = e.offsetY;


		},
		false);


	var canvas_2d = canvas_div.appendChild(document.createElement('canvas'));
	canvas_2d.width = canvas_w;
	canvas_2d.height = canvas_h;
	var view_2d = new fo.view_2d(canvas_2d);


	var time_scale = 0.15;



	var update = function(tick) {
		var anim_time = tick.elapsed_time * time_scale;
		pose.update(anim_time);
	}

	var draw_2d = function() {
		var ctx_2d = view_2d.ctx_2d;

		if (ctx_2d) {
			ctx_2d.clearRect(0, 0, ctx_2d.canvas.width, ctx_2d.canvas.height);

			ctx_2d.save();

			// 0,0 at center, x right, y up
			ctx_2d.translate(ctx_2d.canvas.width / 2, ctx_2d.canvas.height / 2);
			ctx_2d.scale(1, -1);

			// apply camera
			ctx_2d.scale(1 / camera_scale, 1 / camera_scale);
			ctx_2d.rotate(-camera_angle * Math.PI / 180);
			ctx_2d.translate(-camera_x, -camera_y);


			view_2d.draw_pose_2d(pose);


			ctx_2d.restore();
		}
	}

	var tick = new Object();
	tick.frame = 0;
	tick.time = 0;
	tick.time_last = 0;
	tick.elapsed_time = 0;

	var loop = function(time) {
		window.requestAnimationFrame(loop, null);

		++tick.frame;
		tick.time = time;

		tick.elapsed_time = Math.min(tick.time - tick.time_last, 50);

		update(tick);

		tick.time_last = time;

		draw_2d();
	}

	loop(tick.time_last);
}

/**
 * @return {object}
 * @param {spriter.pose} pose
 * @param {object=} extent
 */
var get_pose_extent = function(pose, extent) {
	extent = extent || {
		min: {
			x: 1,
			y: 1
		},
		max: {
			x: -1,
			y: -1
		}
	};

	var bound = function(v) {
		if (extent.min.x > extent.max.x) {
			extent.min.x = extent.max.x = v.x;
			extent.min.y = extent.max.y = v.y;
		} else {
			extent.min.x = Math.min(extent.min.x, v.x);
			extent.max.x = Math.max(extent.max.x, v.x);
			extent.min.y = Math.min(extent.min.y, v.y);
			extent.max.y = Math.max(extent.max.y, v.y);
		}
	}

	var mtx = new fo.m3x2();
	var ll = new fo.v2(-1, -1);
	var lr = new fo.v2(1, -1);
	var ul = new fo.v2(-1, 1);
	var ur = new fo.v2(1, 1);
	var tv = new fo.v2(0, 0);

	pose.strike();

	if (pose.m_data && pose.m_data.folder_array) {
		var folder_array = pose.m_data.folder_array;
		var object_array = pose.m_tweened_object_array;
		for (var object_idx = 0, object_len = object_array.length; object_idx < object_len; ++object_idx) {
			var object = object_array[object_idx];
			var folder = folder_array[object.folder];
			var file = folder.file_array[object.file];

			mtx.makeIdentity();

			// apply object transform
			mtx.selfTranslate(object.x, object.y);
			mtx.selfRotateDegrees(object.angle);
			mtx.selfScale(object.scale_x, object.scale_y);

			// image extents
			var ex = 0.5 * file.width;
			var ey = 0.5 * file.height;
			mtx.selfScale(ex, ey);

			// local pivot in unit (-1 to +1) coordinates
			var lpx = (object.pivot_x * 2) - 1;
			var lpy = (object.pivot_y * 2) - 1;
			mtx.selfTranslate(-lpx, -lpy);

			bound(mtx.applyVector(ul, tv));
			bound(mtx.applyVector(ur, tv));
			bound(mtx.applyVector(lr, tv));
			bound(mtx.applyVector(ll, tv));
		}
	}

	return extent;
}

var fo = fo || {};

/**
 * @constructor
 * @param {HTMLCanvasElement} canvas_2d
 */
fo.view_2d = function(canvas_2d) {
	this.ctx_2d = canvas_2d.getContext('2d');
}

/**
 * @return {void}
 * @param {spriter.pose} pose
 */
fo.view_2d.prototype.draw_pose_2d = function(pose) {
	var ctx_2d = this.ctx_2d;

	pose.strike();

	if (pose.m_data && pose.m_data.folder_array) {
		var folder_array = pose.m_data.folder_array;
		var object_array = pose.m_tweened_object_array;
		for (var object_idx = 0, object_len = object_array.length; object_idx < object_len; ++object_idx) {
			var object = object_array[object_idx];
			var folder = folder_array[object.folder];
			var file = folder.file_array[object.file];

			ctx_2d.save();

			// apply object transform
			ctx_2d.translate(object.x, object.y);
			ctx_2d.rotate(object.angle * Math.PI / 180);
			ctx_2d.scale(object.scale_x, object.scale_y);

			// image extents
			var ex = 0.5 * file.width;
			var ey = 0.5 * file.height;
			//ctx_2d.scale(ex, ey);

			// local pivot in unit (-1 to +1) coordinates
			var lpx = (object.pivot_x * 2) - 1;
			var lpy = (object.pivot_y * 2) - 1;
			//ctx_2d.translate(-lpx, -lpy);
			ctx_2d.translate(-lpx * ex, -lpy * ey);

			if (file.image && !file.image.hidden) {
				ctx_2d.scale(1, -1); // -y for canvas space

				ctx_2d.globalAlpha = object.a;

				//ctx_2d.drawImage(file.image, -1, -1, 2, 2);
				ctx_2d.drawImage(file.image, -ex, -ey, 2 * ex, 2 * ey);
			} else {
				ctx_2d.fillStyle = 'rgba(127,127,127,0.5)';
				//ctx_2d.fillRect(-1, -1, 2, 2);
				ctx_2d.fillRect(-ex, -ey, 2 * ex, 2 * ey);
			}

			ctx_2d.restore();
		}
	}
}