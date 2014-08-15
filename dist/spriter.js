'use strict';
/**
 * Copyright (c) 2012 Flyover Games, LLC
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to
 * whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall
 * be included in all copies or substantial portions of the
 * Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
 * KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var fo = fo || {};

fo.v2 = function(x, y) {
	this.x = x || 0;
	this.y = y || 0;
};

fo.v2.ZERO = new fo.v2();

fo.v2.prototype.makeZero = function() {
	this.x = 0;
	this.y = 0;
	return this;
};

fo.v2.prototype.selfTranslate = function(x, y) {
	this.x += x;
	this.y += y;
	return this;
};

fo.v2.prototype.selfRotate = function(c, s) {
	var x = this.x,
		y = this.y;
	this.x = x * c - y * s;
	this.y = x * s + y * c;
	return this;
};

fo.v2.prototype.selfRotateRadians = function(rad) {
	return this.selfRotate(Math.cos(rad), Math.sin(rad));
};

fo.v2.prototype.selfRotateDegrees = function(deg) {
	return this.selfRotateRadians(deg * Math.PI / 180);
};

fo.v2.prototype.selfScale = function(x, y) {
	this.x *= x;
	this.y *= y;
	return this;
};

fo.m3x2 = function() {
	this.a_x = 1;
	this.b_x = 0;
	this.c_x = 0;
	this.a_y = 0;
	this.b_y = 1;
	this.c_y = 0;
};

fo.m3x2.IDENTITY = new fo.m3x2();

fo.m3x2.prototype.makeIdentity = function() {
	this.a_x = 1;
	this.b_x = 0;
	this.c_x = 0;
	this.a_y = 0;
	this.b_y = 1;
	this.c_y = 0;
	return this;
};

fo.m3x2.prototype.selfTranslate = function(x, y) {
	this.c_x += this.a_x * x + this.b_x * y;
	this.c_y += this.a_y * x + this.b_y * y;
	return this;
};

fo.m3x2.prototype.selfRotate = function(c, s) {
	var A_a_x = this.a_x,
		A_a_y = this.a_y;
	var A_b_x = this.b_x,
		A_b_y = this.b_y;
	var B_a_x = c,
		B_a_y = s;
	var B_b_x = -s,
		B_b_y = c;
	this.a_x = A_a_x * B_a_x + A_b_x * B_a_y;
	this.a_y = A_a_y * B_a_x + A_b_y * B_a_y;
	this.b_x = A_a_x * B_b_x + A_b_x * B_b_y;
	this.b_y = A_a_y * B_b_x + A_b_y * B_b_y;
	return this;
};

fo.m3x2.prototype.selfRotateRadians = function(rad) {
	return this.selfRotate(Math.cos(rad), Math.sin(rad));
};

fo.m3x2.prototype.selfRotateDegrees = function(deg) {
	return this.selfRotateRadians(deg * Math.PI / 180);
};

fo.m3x2.prototype.selfScale = function(x, y) {
	this.a_x *= x;
	this.a_y *= x;
	this.b_x *= y;
	this.b_y *= y;
	return this;
};

fo.m3x2.prototype.applyVector = function(v, out) {
	var v_x = v.x,
		v_y = v.y;
	out.x = this.a_x * v_x + this.b_x * v_y + this.c_x;
	out.y = this.a_y * v_x + this.b_y * v_y + this.c_y;
	return out;
};;'use strict';
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
};// shim: window.requestAnimationFrame window.cancelAnimationFrame
/* scope */ ;(function ()
{
	var vendors = ['ms', 'Moz', 'Webkit', 'O'];

	for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i)
	{
		window.requestAnimationFrame = window[vendors[i]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[i]+'CancelAnimationFrame'] || window[vendors[i]+'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
	{
		var lastTime = 0;
		window.requestAnimationFrame = function (callback, element)
		{
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		}
	}

	if (!window.cancelAnimationFrame)
	{
		window.cancelAnimationFrame = function (id)
		{
			window.clearTimeout(id);
		}
	}
}
/* scope */ )();

;/**
 * Copyright (c) 2012 Flyover Games, LLC
 *
 * Jason Andersen jgandersen@gmail.com
 * Isaac Burns isaacburns@gmail.com
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to
 * whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall
 * be included in all copies or substantial portions of the
 * Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
 * KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * A JavaScript API for the Spriter SCML animation data format.
 */
var spriter = spriter || {};

/**
 * @return {boolean}
 * @param {string} value
 * @param {boolean=} def
 */
spriter.toBool = function(value, def) {
	if (value !== undefined) {
		return 'true' === value ? true : false;
	}
	return def || false;
}

/**
 * @return {number}
 * @param {string} value
 * @param {number=} def
 */
spriter.toInt = function(value, def) {
	if (value !== undefined) {
		return parseInt(value, 10);
	}
	return def || 0;
}

/**
 * @return {number}
 * @param {string} value
 * @param {number=} def
 */
spriter.toFloat = function(value, def) {
	if (value !== undefined) {
		return parseFloat(value);
	}
	return def || 0;
}

/**
 * @return {string}
 * @param {string} value
 * @param {string=} def
 */
spriter.toString = function(value, def) {
	if (value !== undefined) {
		return value;
	}
	return def || "";
}

/**
 * @return {Array}
 * @param {*} value
 * @param {Array=} def
 */
spriter.toArray = function(value, def) {
	if (value) {
		if (value.length) {
			return /** @type {Array} */ value;
		}

		return [value];
	}

	return def || [];
}

/**
 * @return {number}
 * @param {number} a
 * @param {number} b
 * @param {number} t
 */
spriter.tween = function(a, b, t) {
	return a + ((b - a) * t);
}

/**
 * @return {number}
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @param {number} spin
 */
spriter.tweenAngle = function(a, b, t, spin) {
	if ((spin > 0) && (a > b)) {
		return a + ((b + 360 - a) * t); // counter clockwise
	} else if ((spin < 0) && (a < b)) {
		return a + ((b - 360 - a) * t); // clockwise
	}
	return a + ((b - a) * t);
}

/**
 * @return {void}
 * @param {spriter.bone|spriter.object} bone
 * @param {spriter.bone} parent_bone
 */
spriter.combineParent = function(bone, parent_bone) {
	bone.x *= parent_bone.scale_x;
	bone.y *= parent_bone.scale_y;

	var rad = parent_bone.angle * Math.PI / 180;
	var rc = Math.cos(rad),
		rs = Math.sin(rad);
	var tx = bone.x,
		ty = bone.y;
	bone.x = tx * rc - ty * rs;
	bone.y = tx * rs + ty * rc;

	bone.x += parent_bone.x;
	bone.y += parent_bone.y;
	bone.angle += parent_bone.angle;
	bone.scale_x *= parent_bone.scale_x;
	bone.scale_y *= parent_bone.scale_y;
}

/**
 * @constructor
 */
spriter.file = function() {
	/** @type {number} */
	this.id = -1;
	/** @type {string} */
	this.name = "";
	/** @type {number} */
	this.width = 0;
	/** @type {number} */
	this.height = 0;
}

/**
 * @return {spriter.file}
 * @param {Object} json
 */
spriter.file.prototype.load = function(json) {
	this.id = spriter.toInt(json['@id'], -1);
	this.name = spriter.toString(json['@name'], "");
	this.width = spriter.toInt(json['@width'], 0);
	this.height = spriter.toInt(json['@height'], 0);
	return this;
}

/**
 * @constructor
 */
spriter.folder = function() {
	/** @type {number} */
	this.id = -1;
	/** @type {Array.<spriter.file>} */
	this.file_array = null;
}

/**
 * @return {spriter.folder}
 * @param {Object} json
 */
spriter.folder.prototype.load = function(json) {
	this.id = spriter.toInt(json['@id'], -1);
	this.file_array = [];
	json.file = spriter.toArray(json.file);
	for (var file_idx = 0, file_len = json.file.length; file_idx < file_len; ++file_idx) {
		this.file_array.push(new spriter.file().load(json.file[file_idx]));
	}

	return this;
}

/**
 * @constructor
 */
spriter.bone = function() {
	/** @type {number} */
	this.id = -1;
	/** @type {number} */
	this.parent = -1;
	/** @type {number} */
	this.x = 0;
	/** @type {number} */
	this.y = 0;
	/** @type {number} */
	this.angle = 0;
	/** @type {number} */
	this.scale_x = 1;
	/** @type {number} */
	this.scale_y = 1;
}

/**
 * @return {spriter.bone}
 * @param {Object} json
 */
spriter.bone.prototype.load = function(json) {
	this.id = spriter.toInt(json['@id'], -1);
	this.parent = spriter.toInt(json['@parent'], -1);
	this.x = spriter.toFloat(json['@x'], 0);
	this.y = spriter.toFloat(json['@y'], 0);
	this.angle = spriter.toFloat(json['@angle'], 0);
	this.scale_x = spriter.toFloat(json['@scale_x'], 1);
	this.scale_y = spriter.toFloat(json['@scale_y'], 1);
	return this;
}

/**
 * @return {spriter.bone}
 * @param {spriter.bone=} other
 */
spriter.bone.prototype.clone = function(other) {
	return (other || new spriter.bone()).copy(this);
}

/**
 * @return {spriter.bone}
 * @param {spriter.bone} other
 */
spriter.bone.prototype.copy = function(other) {
	this.id = other.id;
	this.parent = other.parent;
	this.x = other.x;
	this.y = other.y;
	this.angle = other.angle;
	this.scale_x = other.scale_x;
	this.scale_y = other.scale_y;
	return this;
}

/**
 * @return {void}
 * @param {spriter.bone} other
 * @param {number} tween
 * @param {number} spin
 */
spriter.bone.prototype.tween = function(other, tween, spin) {
	this.x = spriter.tween(this.x, other.x, tween);
	this.y = spriter.tween(this.y, other.y, tween);
	this.angle = spriter.tweenAngle(this.angle, other.angle, tween, spin);
	this.scale_x = spriter.tween(this.scale_x, other.scale_x, tween);
	this.scale_y = spriter.tween(this.scale_y, other.scale_y, tween);
}

/**
 * @constructor
 */
spriter.bone_ref = function() {
	/** @type {number} */
	this.id = -1;
	/** @type {number} */
	this.parent = -1;
	/** @type {number} */
	this.timeline = 0;
	/** @type {number} */
	this.key = 0;
}

/**
 * @return {spriter.bone_ref}
 * @param {Object} json
 */
spriter.bone_ref.prototype.load = function(json) {
	this.id = spriter.toInt(json['@id'], -1);
	this.parent = spriter.toInt(json['@parent'], -1);
	this.timeline = spriter.toInt(json['@timeline'], 0);
	this.key = spriter.toInt(json['@key'], 0);
	return this;
}

/**
 * @return {spriter.bone_ref}
 * @param {spriter.bone_ref=} other
 */
spriter.bone_ref.prototype.clone = function(other) {
	return (other || new spriter.bone_ref()).copy(this);
}

/**
 * @return {spriter.bone_ref}
 * @param {spriter.bone_ref} other
 */
spriter.bone_ref.prototype.copy = function(other) {
	this.id = other.id;
	this.parent = other.parent;
	this.timeline = other.timeline;
	this.key = other.key;
	return this;
}

/**
 * @constructor
 */
spriter.object = function() {
	/** @type {number} */
	this.id = -1;
	/** @type {number} */
	this.parent = -1;
	/** @type {number} */
	this.folder = 0;
	/** @type {number} */
	this.file = 0;
	/** @type {number} */
	this.x = 0;
	/** @type {number} */
	this.y = 0;
	/** @type {number} */
	this.angle = 0;
	/** @type {number} */
	this.scale_x = 1;
	/** @type {number} */
	this.scale_y = 1;
	/** @type {number} */
	this.pivot_x = 0;
	/** @type {number} */
	this.pivot_y = 1;
	/** @type {number} */
	this.z_index = 0;
	/** @type {number} */
	this.a = 1;
}

/**
 * @return {spriter.object}
 * @param {Object} json
 */
spriter.object.prototype.load = function(json) {
	this.id = spriter.toInt(json['@id'], -1);
	this.parent = spriter.toInt(json['@parent'], -1);
	this.folder = spriter.toInt(json['@folder'], 0);
	this.file = spriter.toInt(json['@file'], 0);
	this.x = spriter.toFloat(json['@x'], 0);
	this.y = spriter.toFloat(json['@y'], 0);
	this.angle = spriter.toFloat(json['@angle'], 0);
	this.scale_x = spriter.toFloat(json['@scale_x'], 1);
	this.scale_y = spriter.toFloat(json['@scale_y'], 1);
	this.pivot_x = spriter.toFloat(json['@pivot_x'], 0);
	this.pivot_y = spriter.toFloat(json['@pivot_y'], 1);
	this.z_index = spriter.toInt(json['@z_index'], 0);
	this.a = spriter.toFloat(json['@a'], 1);
	return this;
}

/**
 * @return {spriter.object}
 * @param {spriter.object=} other
 */
spriter.object.prototype.clone = function(other) {
	return (other || new spriter.object()).copy(this);
}

/**
 * @return {spriter.object}
 * @param {spriter.object} other
 */
spriter.object.prototype.copy = function(other) {
	this.id = other.id;
	this.parent = other.parent;
	this.folder = other.folder;
	this.file = other.file;
	this.x = other.x;
	this.y = other.y;
	this.angle = other.angle;
	this.scale_x = other.scale_x;
	this.scale_y = other.scale_y;
	this.pivot_x = other.pivot_x;
	this.pivot_y = other.pivot_y;
	this.z_index = other.z_index;
	this.a = other.a;
	return this;
}

/**
 * @return {void}
 * @param {spriter.object} other
 * @param {number} tween
 * @param {number} spin
 */
spriter.object.prototype.tween = function(other, tween, spin) {
	this.x = spriter.tween(this.x, other.x, tween);
	this.y = spriter.tween(this.y, other.y, tween);
	this.angle = spriter.tweenAngle(this.angle, other.angle, tween, spin);
	this.scale_x = spriter.tween(this.scale_x, other.scale_x, tween);
	this.scale_y = spriter.tween(this.scale_y, other.scale_y, tween);
	this.pivot_x = spriter.tween(this.pivot_x, other.pivot_x, tween);
	this.pivot_y = spriter.tween(this.pivot_y, other.pivot_y, tween);
	this.a = spriter.tween(this.a, other.a, tween);
}

/**
 * @constructor
 */
spriter.object_ref = function() {
	/** @type {number} */
	this.id = -1;
	/** @type {number} */
	this.parent = -1;
	/** @type {number} */
	this.timeline = 0;
	/** @type {number} */
	this.key = 0;
	/** @type {number} */
	this.z_index = 0;
}

/**
 * @return {spriter.object_ref}
 * @param {Object} json
 */
spriter.object_ref.prototype.load = function(json) {
	this.id = spriter.toInt(json['@id'], -1);
	this.parent = spriter.toInt(json['@parent'], -1);
	this.timeline = spriter.toInt(json['@timeline'], 0);
	this.key = spriter.toInt(json['@key'], 0);
	this.z_index = spriter.toInt(json['@z_index'], 0);
	return this;
}

/**
 * @return {spriter.object_ref}
 * @param {spriter.object_ref=} other
 */
spriter.object_ref.prototype.clone = function(other) {
	return (other || new spriter.object_ref()).copy(this);
}

/**
 * @return {spriter.object_ref}
 * @param {spriter.object_ref} other
 */
spriter.object_ref.prototype.copy = function(other) {
	this.id = other.id;
	this.parent = other.parent;
	this.timeline = other.timeline;
	this.key = other.key;
	this.z_index = other.z_index;
	return this;
}

/**
 * @constructor
 */
spriter.mainline_key = function() {
	/** @type {number} */
	this.id = -1;
	/** @type {number} */
	this.time = 0;
	/** @type {Array.<spriter.bone|spriter.bone_ref>} */
	this.bone_array = null;
	/** @type {Array.<spriter.object|spriter.object_ref>} */
	this.object_array = null;
}

/**
 * @return {spriter.mainline_key}
 * @param {Object} json
 */
spriter.mainline_key.prototype.load = function(json) {
	this.id = spriter.toInt(json['@id'], -1);
	this.time = spriter.toInt(json['@time'], 0);

	// combine bones and bone_refs into one array and sort by id
	this.bone_array = [];
	json.bone = spriter.toArray(json.bone);
	for (var bone_idx = 0, bone_len = json.bone.length; bone_idx < bone_len; ++bone_idx) {
		this.bone_array.push(new spriter.bone().load(json.bone[bone_idx]));
	}
	json.bone_ref = spriter.toArray(json.bone_ref);
	for (var bone_ref_idx = 0, bone_ref_len = json.bone_ref.length; bone_ref_idx < bone_ref_len; ++bone_ref_idx) {
		this.bone_array.push(new spriter.bone_ref().load(json.bone_ref[bone_ref_idx]));
	}
	this.bone_array.sort(function(a, b) {
		return a.id - b.id;
	});

	// combine objects and object_refs into one array and sort by id
	this.object_array = [];
	json.object = spriter.toArray(json.object);
	for (var object_idx = 0, object_len = json.object.length; object_idx < object_len; ++object_idx) {
		this.object_array.push(new spriter.object().load(json.object[object_idx]));
	}
	json.object_ref = spriter.toArray(json.object_ref);
	for (var object_ref_idx = 0, object_ref_len = json.object_ref.length; object_ref_idx < object_ref_len; ++object_ref_idx) {
		this.object_array.push(new spriter.object_ref().load(json.object_ref[object_ref_idx]));
	}
	this.object_array.sort(function(a, b) {
		return a.id - b.id;
	});

	return this;
}

/**
 * @constructor
 */
spriter.mainline = function() {
	/** @type {Array.<spriter.mainline_key>} */
	this.key_array = null;
}

/**
 * @return {spriter.mainline}
 * @param {Object} json
 */
spriter.mainline.prototype.load = function(json) {
	this.key_array = [];
	json.key = spriter.toArray(json.key);
	for (var key_idx = 0, key_len = json.key.length; key_idx < key_len; ++key_idx) {
		this.key_array.push(new spriter.mainline_key().load(json.key[key_idx]));
	}

	return this;
}

/**
 * @constructor
 */
spriter.timeline_key = function() {
	/** @type {number} */
	this.id = -1;
	/** @type {number} */
	this.time = 0;
	/** @type {number} */
	this.spin = 1; // 1: counter-clockwise, -1: clockwise
	/** @type {spriter.bone} */
	this.bone = null;
	/** @type {spriter.object} */
	this.object = null;
}

/**
 * @return {spriter.timeline_key}
 * @param {Object} json
 */
spriter.timeline_key.prototype.load = function(json) {
	this.id = spriter.toInt(json['@id'], -1);
	this.time = spriter.toInt(json['@time'], 0);
	this.spin = spriter.toInt(json['@spin'], 1);

	var bone = json.bone;
	// if bone is all defaults this happens
	if ((0 === bone) || (null === bone)) {
		bone = {};
	}
	if (bone) {
		this.bone = new spriter.bone().load(bone);
	}

	var object = json.object;
	// if object is all defaults this happens
	if ((0 === object) || (null === object)) {
		object = {};
	}
	if (object) {
		this.object = new spriter.object().load(object);
	}

	return this;
}

/**
 * @constructor
 */
spriter.timeline = function() {
	/** @type {number} */
	this.id = -1;
	/** @type {string} */
	this.name = "";

	/** @type {Array.<spriter.timeline_key>} */
	this.key_array = null;
}

/**
 * @return {spriter.timeline}
 * @param {Object} json
 */
spriter.timeline.prototype.load = function(json) {
	this.id = spriter.toInt(json['@id'], -1);
	this.name = spriter.toString(json['@name'], "");

	this.key_array = [];
	json.key = spriter.toArray(json.key);
	for (var key_idx = 0, key_len = json.key.length; key_idx < key_len; ++key_idx) {
		this.key_array.push(new spriter.timeline_key().load(json.key[key_idx]));
	}

	return this;
}

/**
 * @constructor
 */
spriter.animation = function() {
	/** @type {number} */
	this.id = -1;
	/** @type {string} */
	this.name = "";
	/** @type {number} */
	this.length = 0;
	/** @type {string} */
	this.looping = "true"; // "true", "false" or "ping_pong"
	/** @type {number} */
	this.loop_to = 0;
	/** @type {spriter.mainline} */
	this.mainline = null;
	/** @type {Array.<spriter.timeline>} */
	this.timeline_array = null;
}

/**
 * @return {spriter.animation}
 * @param {Object} json
 */
spriter.animation.prototype.load = function(json) {
	this.id = spriter.toInt(json['@id'], -1);
	this.name = spriter.toString(json['@name'], "");
	this.length = spriter.toInt(json['@length'], 0);
	this.looping = spriter.toString(json['@looping'], "true");
	this.loop_to = spriter.toInt(json['@loop_to'], 0);

	json.mainline = json.mainline || {};
	this.mainline = new spriter.mainline().load(json.mainline);

	this.timeline_array = [];
	json.timeline = spriter.toArray(json.timeline);
	for (var timeline_idx = 0, timeline_len = json.timeline.length; timeline_idx < timeline_len; ++timeline_idx) {
		this.timeline_array.push(new spriter.timeline().load(json.timeline[timeline_idx]));
	}

	return this;
}

/**
 * @constructor
 */
spriter.entity = function() {
	/** @type {number} */
	this.id = -1;
	/** @type {string} */
	this.name = "";
	/** @type {Array.<spriter.animation>} */
	this.animation_array = null;
}

/**
 * @return {spriter.entity}
 * @param {Object} json
 */
spriter.entity.prototype.load = function(json) {
	this.id = spriter.toInt(json['@id'], -1);
	this.name = spriter.toString(json['@name'], "");

	this.animation_array = [];
	json.animation = spriter.toArray(json.animation);
	for (var animation_idx = 0, animation_len = json.animation.length; animation_idx < animation_len; ++animation_idx) {
		this.animation_array.push(new spriter.animation().load(json.animation[animation_idx]));
	}

	return this;
}

/**
 * @constructor
 */
spriter.data = function() {
	/** @type {Array.<spriter.folder>} */
	this.folder_array = null;

	/** @type {Array.<spriter.entity>} */
	this.entity_array = null;
}

/**
 * @return {spriter.data}
 * @param {Object} json
 */
spriter.data.prototype.load = function(json) {
	this.folder_array = [];
	json.folder = spriter.toArray(json.folder);
	for (var folder_idx = 0, folder_len = json.folder.length; folder_idx < folder_len; ++folder_idx) {
		this.folder_array.push(new spriter.folder().load(json.folder[folder_idx]));
	}

	this.entity_array = [];
	json.entity = spriter.toArray(json.entity);
	for (var entity_idx = 0; entity_idx < json.entity.length; ++entity_idx) {
		this.entity_array.push(new spriter.entity().load(json.entity[entity_idx]));
	}

	return this;
}

/**
 * @return {void}
 * @param {string} scml
 */
spriter.data.prototype.parseSCML = function(scml) {
	var dom_parser = new DOMParser();
	var xml_object = dom_parser.parseFromString(scml, "text/xml");
	var json_string = xml2json(xml_object, "  ");
	var json = /** @type {Object} */ window.JSON.parse(json_string);
	if (json.spriter_data) {
		this.load(json.spriter_data);
	}
}

/**
 * @return {void}
 * @param {string} url
 * @param {function()} callback
 */
spriter.data.prototype.loadFromURL = function(url, callback) {
	var that = this;

	var count = 0;
	var inc_count = function() {
		count++;
	}
	var dec_count = function() {
		if (--count == 0) {
			callback();
		}
	}

	inc_count(); // url

	var req = new XMLHttpRequest();
	req.open("GET", url, true);
	req.addEventListener('readystatechange', function(e) {
			if (req.readyState != 4) return;
			if (req.status != 200 && req.status != 304) {
				return;
			}

			that.parseSCML(req.responseText);

			// load texture files from url

			var base_path = url.slice(0, url.lastIndexOf('/'));
			var folder_array = that.folder_array;
			for (var folder_idx = 0, folder_len = folder_array.length; folder_idx < folder_len; ++folder_idx) {
				var folder = folder_array[folder_idx];
				var file_array = folder.file_array;
				for (var file_idx = 0, file_len = file_array.length; file_idx < file_len; ++file_idx) {
					var file = file_array[file_idx];

					inc_count(); // texture_file
					var image = file.image = new Image();
					image.hidden = true;
					image.addEventListener('load', (function(file) {
						return function(e) {
							file.width = file.width || e.target.width;
							file.height = file.height || e.target.height;
							e.target.hidden = false;
							dec_count(); // texture_file
						}
					})(file), false);
					image.addEventListener('error', function(e) {
						dec_count();
					}, false); // texture_file
					image.addEventListener('abort', function(e) {
						dec_count();
					}, false); // texture_file
					image.src = base_path + '/' + file.name;
				}
			}

			dec_count(); // url
		},
		false);
	if (req.readyState == 4) {
		return;
	}
	try {
		req.send(false);
	} catch (e) {
		req.send();
	}
}

/**
 * @return {void}
 * @param {File} input_file
 * @param {FileList} input_files
 * @param {function()} callback
 */
spriter.data.prototype.loadFromFileList = function(input_file, input_files, callback) {
	var that = this;

	var count = 0;
	var inc_count = function() {
		count++;
	}
	var dec_count = function() {
		if (--count == 0) {
			callback();
		}
	}

	inc_count(); // input_file

	var file_reader = new FileReader();
	file_reader.addEventListener('load', function(e) {
			that.parseSCML(e.target.result);

			// load texture files from file list

			var find_file = function(input_files, texture_name) {
				var name = texture_name.toLowerCase() + '$'; // match at end of line only
				for (var idx = 0, len = input_files.length; idx < len; ++idx) {
					var input_file = input_files[idx];
					input_file.webkitRelativePath = input_file.webkitRelativePath || "";
					var path = input_file.webkitRelativePath;
					if (path && path.toLowerCase().match(name)) {
						return input_file;
					}
				}
				return null;
			}

			var folder_array = that.folder_array;
			for (var folder_idx = 0, folder_len = folder_array.length; folder_idx < folder_len; ++folder_idx) {
				var folder = folder_array[folder_idx];
				var file_array = folder.file_array;
				for (var file_idx = 0, file_len = file_array.length; file_idx < file_len; ++file_idx) {
					var file = file_array[file_idx];
					var texture_file = find_file(input_files, file.name);
					if (texture_file) {
						inc_count(); // texture_file
						var texture_file_reader = new FileReader();
						texture_file_reader.addEventListener('load', (function(file) {
							return function(e) {
								var image = file.image = new Image();
								image.hidden = true;
								image.addEventListener('load', function(e) {
										file.width = file.width || e.target.width;
										file.height = file.height || e.target.height;
										e.target.hidden = false;
										dec_count(); // texture_file
									},
									false);
								image.addEventListener('error', function(e) {
									dec_count();
								}, false); // texture_file
								image.addEventListener('abort', function(e) {
									dec_count();
								}, false); // texture_file
								image.src = e.target.result;
							}
						})(file), false);
						texture_file_reader.readAsDataURL(texture_file);
					}
				}
			}

			dec_count(); // input_file
		},
		false);
	file_reader.readAsText(input_file);
}

/**
 * @return {void}
 * @param {FileEntry} entry
 * @param {function()} callback
 */
spriter.data.prototype.loadFromFileEntry = function(entry, callback) {
	var that = this;

	var count = 0;
	var inc_count = function() {
		count++;
	}
	var dec_count = function() {
		if (--count == 0) {
			callback();
		}
	}

	inc_count(); // entry

	entry.file(function(file) {
		var reader = new FileReader();
		reader.addEventListener('load', function(e) {
				that.parseSCML(e.target.result);

				// load textures from file entry filesystem root

				var folder_array = that.folder_array;
				for (var folder_idx = 0, folder_len = folder_array.length; folder_idx < folder_len; ++folder_idx) {
					var folder = folder_array[folder_idx];
					var file_array = folder.file_array;
					for (var file_idx = 0, file_len = file_array.length; file_idx < file_len; ++file_idx) {
						var file = file_array[file_idx];
						inc_count(); // texture_entry
						entry.filesystem.root.getFile(file.name, {}, (function(file) {
							return function(texture_entry) {
								inc_count(); // texture_file
								texture_entry.file(function(texture_file) {
										var texture_file_reader = new FileReader();
										texture_file_reader.addEventListener('load', function(e) {
												var image = file.image = new Image();
												image.hidden = true;
												image.addEventListener('load', function(e) {
														file.width = file.width || e.target.width;
														file.height = file.height || e.target.height;
														e.target.hidden = false;
														dec_count(); // texture_file
													},
													false);
												image.addEventListener('error', function(e) {
													dec_count();
												}, false); // texture_file
												image.addEventListener('abort', function(e) {
													dec_count();
												}, false); // texture_file
												image.src = e.target.result;
											},
											false);
										texture_file_reader.readAsDataURL(texture_file);
									},
									function() {
										dec_count(); // texture_file
									});
								dec_count(); // texture_entry
							}
						})(file), (function(file) {
							return function(e) {
								window.console.log("error code: " + e.code + ", could not load texture: " + file.name);
								dec_count(); // texture_entry
							}
						})(file));
					}
				}
				dec_count(); // entry
			},
			false);
		reader.readAsText(file);
	});
}

/**
 * @return {number}
 */
spriter.data.prototype.getNumEntities = function() {
	var entity_array = this.entity_array;
	if (entity_array) {
		return entity_array.length;
	}
	return 0;
}

/**
 * @return {string}
 * @param {number} entity_index
 */
spriter.data.prototype.getEntityName = function(entity_index) {
	var entity_array = this.entity_array;
	if (entity_array && (entity_index < entity_array.length)) {
		var entity = entity_array[entity_index];
		return entity.name;
	}
	return "";
}

/**
 * @return {number}
 * @param {number} entity_index
 */
spriter.data.prototype.getNumAnims = function(entity_index) {
	var entity_array = this.entity_array;
	if (entity_array && (entity_index < entity_array.length)) {
		var entity = entity_array[entity_index];
		var animation_array = entity.animation_array;
		if (animation_array) {
			return animation_array.length;
		}
	}
	return 0;
}

/**
 * @return {string}
 * @param {number} entity_index
 * @param {number} anim_index
 */
spriter.data.prototype.getAnimName = function(entity_index, anim_index) {
	var entity_array = this.entity_array;
	if (entity_array && (entity_index < entity_array.length)) {
		var entity = entity_array[entity_index];
		var animation_array = entity.animation_array;
		if (animation_array && (anim_index < animation_array.length)) {
			var anim = animation_array[anim_index];
			return anim.name;
		}
	}
	return "";
}

/**
 * @return {number}
 * @param {number} entity_index
 * @param {number} anim_index
 */
spriter.data.prototype.getAnimLength = function(entity_index, anim_index) {
	var entity_array = this.entity_array;
	if (entity_array && (entity_index < entity_array.length)) {
		var entity = entity_array[entity_index];
		var animation_array = entity.animation_array;
		if (animation_array && (anim_index < animation_array.length)) {
			var anim = animation_array[anim_index];
			return anim.length;
		}
	}
	return -1;
}

/**
 * @return {number}
 * @param {number} entity_index
 * @param {number} anim_index
 */
spriter.data.prototype.getNumAnimKeys = function(entity_index, anim_index) {
	var entity_array = this.entity_array;
	if (entity_array && (entity_index < entity_array.length)) {
		var entity = entity_array[entity_index];
		var animation_array = entity.animation_array;
		if (animation_array && (anim_index < animation_array.length)) {
			var anim = animation_array[anim_index];
			return anim.mainline.key_array.length;
		}
	}
	return 0;
}

/**
 * @return {number}
 * @param {number} entity_index
 * @param {number} anim_index
 * @param {number} key_index
 */
spriter.data.prototype.getAnimKeyTime = function(entity_index, anim_index, key_index) {
	var entity_array = this.entity_array;
	if (entity_array && (entity_index < entity_array.length)) {
		var entity = entity_array[entity_index];
		var animation_array = entity.animation_array;
		if (animation_array && (anim_index < animation_array.length)) {
			var anim = animation_array[anim_index];
			var key_array = anim.mainline.key_array;
			if (key_array && (key_index < key_array.length)) {
				return key_array[key_index].time;
			}
		}
	}
	return 0;
}

/**
 * @constructor
 * @param {spriter.data=} data
 */
spriter.pose = function(data) {
	/** @type {spriter.data} */
	this.m_data = data || null;

	/** @type {number} */
	this.m_entity_index = 0;
	/** @type {number} */
	this.m_anim_index = 0;
	/** @type {number} */
	this.m_time = 0;

	/** @type {boolean} */
	this.m_dirty = true;

	/** @type {number} */
	this.m_mainline_key_index = 0;

	/** @type {Array.<spriter.bone>} */
	this.m_tweened_bone_array = [];

	/** @type {Array.<spriter.object>} */
	this.m_tweened_object_array = [];
}

/**
 * @return {number}
 */
spriter.pose.prototype.getNumEntities = function() {
	if (this.m_data) {
		return this.m_data.getNumEntities();
	}

	return 0;
}

/**
 * @return {number}
 */
spriter.pose.prototype.getEntity = function() {
	return this.m_entity_index;
}

/**
 * @return {void}
 * @param {number|string} entity_id
 */
spriter.pose.prototype.setEntity = function(entity_id) {
	var num_entities = this.getNumEntities();

	if (isFinite(entity_id)) {
		// set entity by index
		if (entity_id < num_entities) {
			this.m_entity_index = /** @type {number} */ entity_id;
			this.m_anim_index = 0;
			this.m_time = 0;
			this.m_dirty = true;
		}
	} else {
		// set entity by name
		for (var entity_idx = 0; entity_idx < num_entities; ++entity_idx) {
			if (entity_id == this.getEntityName(entity_idx)) {
				this.m_entity_index = entity_idx;
				this.m_anim_index = 0;
				this.m_time = 0;
				this.m_dirty = true;
				break;
			}
		}
	}
}

/**
 * @return {string}
 * @param {number=} entity_index
 */
spriter.pose.prototype.getEntityName = function(entity_index) {
	entity_index = (entity_index !== undefined) ? (entity_index) : (this.m_entity_index);
	if (this.m_data) {
		return this.m_data.getEntityName(entity_index);
	}
	return "";
}

/**
 * @return {number}
 * @param {number=} entity_index
 */
spriter.pose.prototype.getNumAnims = function(entity_index) {
	entity_index = (entity_index !== undefined) ? (entity_index) : (this.m_entity_index);
	if (this.m_data) {
		return this.m_data.getNumAnims(entity_index);
	}
	return 0;
}

/**
 * @return {number}
 */
spriter.pose.prototype.getAnim = function() {
	return this.m_anim_index;
}

/**
 * @return {void}
 * @param {number|string} anim_id
 */
spriter.pose.prototype.setAnim = function(anim_id) {
	if (isFinite(anim_id)) {
		// set animation by index
		if ((0 <= anim_id) && (anim_id < this.getNumAnims())) {
			this.m_anim_index = /** @type {number} */ anim_id;
			this.m_time = 0;
			this.m_dirty = true;
		}
	} else {
		// set animation by name
		for (var anim_idx = 0, anim_len = this.getNumAnims(); anim_idx < anim_len; ++anim_idx) {
			if (anim_id == this.getAnimName(anim_idx)) {
				this.m_anim_index = anim_idx;
				this.m_time = 0;
				this.m_dirty = true;
				break;
			}
		}
	}
}

/**
 * @return {void}
 */
spriter.pose.prototype.setNextAnim = function() {
	var num_anims = this.getNumAnims();
	if (num_anims > 1) {
		this.setAnim((this.getAnim() + 1) % num_anims);
	}
}

/**
 * @return {void}
 */
spriter.pose.prototype.setPrevAnim = function() {
	var num_anims = this.getNumAnims();
	if (num_anims > 1) {
		this.setAnim((this.getAnim() + num_anims - 1) % num_anims);
	}
}

/**
 * @return {string}
 * @param {number=} anim_index
 */
spriter.pose.prototype.getAnimName = function(anim_index) {
	var entity_index = this.m_entity_index;
	anim_index = (anim_index !== undefined) ? (anim_index) : (this.m_anim_index);
	if (this.m_data) {
		return this.m_data.getAnimName(entity_index, anim_index);
	}
	return "";
}

/**
 * @return {number}
 * @param {number=} anim_index
 */
spriter.pose.prototype.getAnimLength = function(anim_index) {
	var entity_index = this.m_entity_index;
	anim_index = (anim_index !== undefined) ? (anim_index) : (this.m_anim_index);
	if (this.m_data) {
		return this.m_data.getAnimLength(entity_index, anim_index);
	}
	return -1;
}

/**
 * @return {number}
 * @param {number=} anim_index
 */
spriter.pose.prototype.getNumAnimKeys = function(anim_index) {
	var entity_index = this.m_entity_index;
	anim_index = (anim_index !== undefined) ? (anim_index) : (this.m_anim_index);
	if (this.m_data) {
		return this.m_data.getNumAnimKeys(entity_index, anim_index);
	}
	return 0;
}

/**
 * @return {number}
 * @param {number=} anim_index
 */
spriter.pose.prototype.getAnimKeyTime = function(anim_index, key_index) {
	var entity_index = this.m_entity_index;
	anim_index = (anim_index !== undefined) ? (anim_index) : (this.m_anim_index);
	if (this.m_data) {
		return this.m_data.getAnimKeyTime(entity_index, anim_index, key_index);
	}
	return 0;
}

/**
 * @return {number}
 * @param {number=} anim_index
 */
spriter.pose.prototype.getNumAnimKeys = function(anim_index) {
	var entity_index = this.m_entity_index;
	anim_index = (anim_index !== undefined) ? (anim_index) : (this.m_anim_index);
	if (this.m_data) {
		return this.m_data.getNumAnimKeys(entity_index, anim_index);
	}
	return 0;
}

/**
 * @return {number}
 * @param {number=} anim_index
 * @param {number=} key_index
 */
spriter.pose.prototype.getAnimKeyTime = function(anim_index, key_index) {
	var entity_index = this.m_entity_index;
	anim_index = (anim_index !== undefined) ? (anim_index) : (this.m_anim_index);
	key_index = (key_index !== undefined) ? (key_index) : (this.m_mainline_key_index);
	if (this.m_data) {
		return this.m_data.getAnimKeyTime(entity_index, anim_index, key_index);
	}
	return 0;
}

/**
 * @return {number}
 */
spriter.pose.prototype.getTime = function() {
	return this.m_time;
}

/**
 * @return {void}
 * @param {number} time
 */
spriter.pose.prototype.setTime = function(time) {
	if (this.m_time != time) {
		this.m_time = time;
		this.m_dirty = true;
	}
}

/**
 * @return {number}
 */
spriter.pose.prototype.getKey = function() {
	return this.m_mainline_key_index;
}

/**
 * @return {void}
 * @param {number} key_index
 */
spriter.pose.prototype.setKey = function(key_index) {
	if (this.m_mainline_key_index != key_index) {
		this.m_time = this.getAnimKeyTime(this.m_anim_index, key_index);
		this.m_dirty = true;
	}
}

/**
 * @return {void}
 * @param {number} elapsed_time
 */
spriter.pose.prototype.update = function(elapsed_time) {
	var anim_length = this.getAnimLength();

	if (anim_length > 0) {
		this.m_time += elapsed_time;

		while (this.m_time < 0) {
			this.m_time += anim_length;
		}
		while (this.m_time >= anim_length) {
			this.m_time -= anim_length;
		}

		this.m_dirty = true;
	}
}

/**
 * @return {void}
 */
spriter.pose.prototype.strike = function() {
	if (!this.m_dirty) {
		return;
	}
	this.m_dirty = false;

	if (this.m_data && this.m_data.entity_array) {
		var entity_array = this.m_data.entity_array;
		var entity = entity_array[this.m_entity_index];
		var animation_array = entity.animation_array;
		var animation = animation_array[this.m_anim_index];
		var mainline = animation.mainline;
		var mainline_key_array = mainline.key_array;

		// find key frame based on requested time
		var tween_time = this.m_time;
		var mainline_key_index = 0;
		for (; mainline_key_index < mainline_key_array.length; ++mainline_key_index) {
			var mainline_key = mainline_key_array[mainline_key_index];
			if (tween_time < mainline_key.time) {
				break;
			}
		}
		if (mainline_key_index > 0) {
			mainline_key_index--;
		} // back up one
		this.m_mainline_key_index = mainline_key_index;

		var mainline_key = mainline_key_array[this.m_mainline_key_index];
		var timeline_array = animation.timeline_array;

		var bone_array = mainline_key.bone_array;
		var tweened_bone_array = this.m_tweened_bone_array;

		for (var bone_idx = 0, bone_len = bone_array.length; bone_idx < bone_len; ++bone_idx) {
			var tweened_bone = tweened_bone_array[bone_idx] = (tweened_bone_array[bone_idx] || new spriter.bone());

			var bone = bone_array[bone_idx];
			var timeline_index = bone.timeline;

			if (timeline_index !== undefined) {
				// bone is a spriter.bone_ref, dereference
				var key_index = bone.key;
				var timeline = timeline_array[timeline_index];
				var timeline_key_array = timeline.key_array;
				var timeline_key = timeline_key_array[key_index];

				var time1 = timeline_key.time;
				var bone1 = timeline_key.bone;
				tweened_bone.copy(bone1);
				tweened_bone.parent = bone.parent; // set parent from bone_ref

				// see if there's something to tween with
				var timeline_key2 = timeline_key_array[key_index + 1];
				if (timeline_key2 !== undefined) {
					var time2 = timeline_key2.time;
					var bone2 = timeline_key2.bone;
					var tween = (tween_time - time1) / (time2 - time1);
					tweened_bone.tween(bone2, tween, timeline_key.spin);
				}
			} else {
				// bone is a spriter.bone, copy
				bone = /** @type {spriter.bone} */ bone;
				tweened_bone.copy(bone);
			}

			// see if there's a parent transform
			var parent_index = bone.parent;
			if (parent_index >= 0) {
				spriter.combineParent(tweened_bone, tweened_bone_array[parent_index]);
			}
		}

		// clamp output bone array
		if (tweened_bone_array.length > bone_array.length) {
			tweened_bone_array.length = bone_array.length;
		}

		var object_array = mainline_key.object_array;
		var tweened_object_array = this.m_tweened_object_array;

		for (var object_idx = 0, object_len = object_array.length; object_idx < object_len; ++object_idx) {
			var tweened_object = tweened_object_array[object_idx] = (tweened_object_array[object_idx] || new spriter.object());

			var object = object_array[object_idx];
			var timeline_index = object.timeline;

			if (timeline_index !== undefined) {
				// object is a spriter.object_ref, dereference
				var key_index = object.key;
				var timeline = timeline_array[timeline_index];
				var timeline_key_array = timeline.key_array;
				var timeline_key = timeline_key_array[key_index];

				var time1 = timeline_key.time;
				var object1 = timeline_key.object;
				tweened_object.copy(object1);
				tweened_object.parent = object.parent; // set parent from object_ref

				// see if there's something to tween with
				var timeline_key2 = timeline_key_array[key_index + 1];
				if (timeline_key2 !== undefined) {
					var time2 = timeline_key2.time;
					var object2 = timeline_key2.object;
					var tween = (tween_time - time1) / (time2 - time1);
					tweened_object.tween(object2, tween, timeline_key.spin);
				}
			} else {
				// object is a spriter.object, copy
				object = /** @type {spriter.object} */ object;
				tweened_object.copy(object);
			}

			// see if there's a parent transform
			var parent_index = object.parent;
			if (parent_index >= 0) {
				spriter.combineParent(tweened_object, tweened_bone_array[parent_index]);
			}
		}

		// clamp output object array
		if (tweened_object_array.length > object_array.length) {
			tweened_object_array.length = object_array.length;
		}
	}
};/*	This work is licensed under Creative Commons GNU LGPL License.

	License: http://creativecommons.org/licenses/LGPL/2.1/
   Version: 0.9
	Author:  Stefan Goessner/2006
	Web:     http://goessner.net/ 
*/
function xml2json(xml, tab) {
   var X = {
      toObj: function(xml) {
         var o = {};
         if (xml.nodeType==1) {   // element node ..
            if (xml.attributes.length)   // element with attributes  ..
               for (var i=0; i<xml.attributes.length; i++)
                  o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
            if (xml.firstChild) { // element has child nodes ..
               var textChild=0, cdataChild=0, hasElementChild=false;
               for (var n=xml.firstChild; n; n=n.nextSibling) {
                  if (n.nodeType==1) hasElementChild = true;
                  else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                  else if (n.nodeType==4) cdataChild++; // cdata section node
               }
               if (hasElementChild) {
                  if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                     X.removeWhite(xml);
                     for (var n=xml.firstChild; n; n=n.nextSibling) {
                        if (n.nodeType == 3)  // text node
                           o["#text"] = X.escape(n.nodeValue);
                        else if (n.nodeType == 4)  // cdata node
                           o["#cdata"] = X.escape(n.nodeValue);
                        else if (o[n.nodeName]) {  // multiple occurence of element ..
                           if (o[n.nodeName] instanceof Array)
                              o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                           else
                              o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                        }
                        else  // first occurence of element..
                           o[n.nodeName] = X.toObj(n);
                     }
                  }
                  else { // mixed content
                     if (!xml.attributes.length)
                        o = X.escape(X.innerXml(xml));
                     else
                        o["#text"] = X.escape(X.innerXml(xml));
                  }
               }
               else if (textChild) { // pure text
                  if (!xml.attributes.length)
                     o = X.escape(X.innerXml(xml));
                  else
                     o["#text"] = X.escape(X.innerXml(xml));
               }
               else if (cdataChild) { // cdata
                  if (cdataChild > 1)
                     o = X.escape(X.innerXml(xml));
                  else
                     for (var n=xml.firstChild; n; n=n.nextSibling)
                        o["#cdata"] = X.escape(n.nodeValue);
               }
            }
            if (!xml.attributes.length && !xml.firstChild) o = null;
         }
         else if (xml.nodeType==9) { // document.node
            o = X.toObj(xml.documentElement);
         }
         else
            alert("unhandled node type: " + xml.nodeType);
         return o;
      },
      toJson: function(o, name, ind) {
         var json = name ? ("\""+name+"\"") : "";
         if (o instanceof Array) {
            for (var i=0,n=o.length; i<n; i++)
               o[i] = X.toJson(o[i], "", ind+"\t");
            json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
         }
         else if (o == null)
            json += (name&&":") + "null";
         else if (typeof(o) == "object") {
            var arr = [];
            for (var m in o)
               arr[arr.length] = X.toJson(o[m], m, ind+"\t");
            json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
         }
         else if (typeof(o) == "string")
            json += (name&&":") + "\"" + o.toString() + "\"";
         else
            json += (name&&":") + o.toString();
         return json;
      },
      innerXml: function(node) {
         var s = ""
         if ("innerHTML" in node)
            s = node.innerHTML;
         else {
            var asXml = function(n) {
               var s = "";
               if (n.nodeType == 1) {
                  s += "<" + n.nodeName;
                  for (var i=0; i<n.attributes.length;i++)
                     s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
                  if (n.firstChild) {
                     s += ">";
                     for (var c=n.firstChild; c; c=c.nextSibling)
                        s += asXml(c);
                     s += "</"+n.nodeName+">";
                  }
                  else
                     s += "/>";
               }
               else if (n.nodeType == 3)
                  s += n.nodeValue;
               else if (n.nodeType == 4)
                  s += "<![CDATA[" + n.nodeValue + "]]>";
               return s;
            };
            for (var c=node.firstChild; c; c=c.nextSibling)
               s += asXml(c);
         }
         return s;
      },
      escape: function(txt) {
         return txt.replace(/[\\]/g, "\\\\")
                   .replace(/[\"]/g, '\\"')
                   .replace(/[\n]/g, '\\n')
                   .replace(/[\r]/g, '\\r');
      },
      removeWhite: function(e) {
         e.normalize();
         for (var n = e.firstChild; n; ) {
            if (n.nodeType == 3) {  // text node
               if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                  var nxt = n.nextSibling;
                  e.removeChild(n);
                  n = nxt;
               }
               else
                  n = n.nextSibling;
            }
            else if (n.nodeType == 1) {  // element node
               X.removeWhite(n);
               n = n.nextSibling;
            }
            else                      // any other node
               n = n.nextSibling;
         }
         return e;
      }
   };
   if (xml.nodeType == 9) // document node
      xml = xml.documentElement;
   var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
   return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
}
