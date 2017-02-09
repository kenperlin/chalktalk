"use strict";

// This adds some code for interfacing with the Tactonic sensor.

(function(global) {
	var fullScreenChange = 0;
	var tt = {};
	var waiter = 0;
 
	tt.ErrorCode = {
		PLUGIN_NOT_FOUND: 1,
		PLUGIN_BLOCKED: 4
	};
 
	tt.DataSourceMode = {
		PLUGIN: 0,
		DRIVER: 1
	};
 
	function inherits(childCtor, parentCtor) {
		function tempCtor() {};
		tempCtor.prototype = parentCtor.prototype;
		childCtor.superClass_ = parentCtor.prototype;
		childCtor.prototype = new tempCtor();
		childCtor.prototype.constructor = childCtor;
	};
 
	tt.DataSource = function() {};
 
	tt.DataSource.prototype.dispose = function() {};
 
	tt.DataSource.prototype.isPresent = function() {return false;};
 
	tt.DataSource.prototype.load = function(callback, opt_scope) {
		global.setTimeout(function() {
			callback.call(opt_scope, null);
		}, 0);
	};
 
	tt.DataSource.prototype.queryHmdInfo = function() {return null;};
 
	tt.DataSource.prototype.resetHmdOrientation = function() {};
 
	tt.DataSource.prototype.poll = function(state) {};
 
	tt.PluginDataSource = function(document) {
		tt.DataSource.call(this);
		this.document_ = document;
		this.native_ = null;
	};
	inherits(tt.PluginDataSource, tt.DataSource);
 
	tt.PluginDataSource.prototype.dispose = function() {
		tt.DataSource.prototype.dispose.call(this);
	};
 
	tt.PluginDataSource.prototype.isPresent = function() {
		var plugins = navigator.plugins;
		plugins.refresh();
		for (var n = 0; n < plugins.length; n++) {
			var plugin = plugins[n];
			for (var m = 0; m < plugin.length; m++) {
				var mimeType = plugin[m];
				if (mimeType.type == 'application/tt') {
					return true;
				}
			}
		}
		return false;
	};
 
	tt.PluginDataSource.prototype.createEmbed_ = function() {
		var embed = this.document_.createElement('embed');
		embed.type = 'application/tt';
		embed.width = 4;
		embed.height = 4;
		embed.style.visibility = 'hidden';
		embed.style.width = '0';
		embed.style.height = '0';
		embed.style.margin = '0';
		embed.style.padding = '0';
		embed.style.borderStyle = 'none';
		embed.style.borderWidth = '0';
		embed.style.maxWidth = '0';
		embed.style.maxHeight = '0';
		return embed;
	};
 
	tt.PluginDataSource.prototype.load = function(callback, opt_scope) {
		var embed = this.createEmbed_();
		this.document_.body.appendChild(embed);
 
		var startTime = Date.now();
		var self = this;
		function checkLoaded() {
			if (global._tt_native_) {
				self.native_ = global._tt_native_;
				callback.call(opt_scope, null);
			} else {
				var elapsed = Date.now() - startTime;
					global.setTimeout(checkLoaded, 100);
					
			}
		};
		checkLoaded();
	};
 
	tt.PluginDataSource.prototype.execCommand_ = function(
		commandId, opt_commandData) {
		if (!this.native_) {
			return '';
		}
		return this.native_.exec(commandId, opt_commandData || '') || '';
	};
 
	tt.PluginDataSource.prototype.queryHmdInfo = function() {
		var queryData = this.execCommand_(1);
		if (!queryData || !queryData.length) {
			return null;
		}
		var values = queryData.split(',');
		return new tt.HmdInfo(values);
	};

	tt.PluginDataSource.prototype.resetHmdOrientation = function() {
		this.execCommand_(2);
	};

	tt.PluginDataSource.prototype.poll = function(state) {
		if (!this.native_) {
			return;
		}
		var pollData = this.native_.poll();
		var deviceChunks = pollData.split('|');
		for (var n = 0; n < deviceChunks.length; n++) {
			var deviceChunk = deviceChunks[n].split(',');
			if (!deviceChunk.length) {
				continue;
			}
			switch (deviceChunk[0]) {
			case 'v':
				this.parseHmdChunk_(state, deviceChunk, 1);
				break;
			}
		}
	};

	tt.PluginDataSource.prototype.parseHmdChunk_ = function(state, data, o) {
		if (data.length > 1000) {
			state.hmd.present = true;
			for(o = 1; o < data.length; o++)
				state.hmd.forces[o-1] = parseFloat(data[o]);
		} else {
			state.hmd.present = false;
		}
	};
 
	tt.DriverDataSource = function(driver) {
		tt.DataSource.call(this);
		this.driver_ = driver;
	};
	inherits(tt.DriverDataSource, tt.DataSource);

	tt.DriverDataSource.prototype.dispose = function() {
		this.driver_.dispose();
		tt.DataSource.prototype.dispose.call(this);
	};

	tt.DriverDataSource.prototype.isPresent = function() {
		return true;
	};

	tt.DriverDataSource.prototype.load = function(callback, opt_scope) {
		global.setTimeout(function() {
			callback.call(opt_scope, null);
		}, 0);
	};

	tt.DriverDataSource.prototype.queryHmdInfo = function() {
		var info = new tt.HmdInfo();
		if (!this.driver_.fillHmdInfo(info)) {
			return null;
		}
		return info;
	};

	tt.DriverDataSource.prototype.resetHmdOrientation = function() {
		this.driver_.resetOrientation();
	};

	tt.DriverDataSource.prototype.poll = function(state) {
		var present = this.driver_.isPresent();
		state.hmd.present = present;
	};

	tt.Runtime = function(document) {

		this.document_ = document;

		this.dataSourceMode_ = tt.DataSourceMode.PLUGIN;

		if (global['__tt_driver__'])
			this.dataSourceMode_ = tt.DataSourceMode.DRIVER;
		var dataSource = null;
		switch (this.dataSourceMode_) {
		default:
		case tt.DataSourceMode.PLUGIN:
			dataSource = new tt.PluginDataSource(this.document_);
			break;
		case tt.DataSourceMode.DRIVER:
			dataSource = new tt.DriverDataSource(global['__tt_driver__']);
			break;
		}

		this.dataSource_ = dataSource;
		this.isInstalled_ = this.dataSource_.isPresent();
		this.isLoaded_ = false;
		this.error_ = null;
		this.isLoading_ = false;
		this.readyWaiters_ = [];
		this.hmdInfo_ = null;
		this.oldWindowSize_ = null;
		var self = this;
	};

	tt.Runtime.prototype.load = function(opt_callback, opt_scope) {
		var self = this;
		if (!this.isInstalled_) {
			var e = new Error('Plugin not installed!');
			e.code = tt.ErrorCode.PLUGIN_NOT_FOUND;
			this.error_ = e;
			if (opt_callback) {
				global.setTimeout(function() {
					opt_callback.call(opt_scope, self.error_);
				}, 0);
			}
			return;
		}

		if (this.isLoaded_ || this.error) {
			if (opt_callback) {
				global.setTimeout(function() {
					opt_callback.call(opt_scope, self.error_);
				}, 0);
			}
			return;
		} else {
			if (opt_callback) {
				this.readyWaiters_.push([opt_callback, opt_scope]);
			}

			if (this.isLoading_) 
				return;
			this.isLoading_ = true;

			tt.waitForDomReady(this.document_, function() {
				this.dataSource_.load(function(opt_error) {
					this.completeLoad_(opt_error);
				}, this);
			}, this);

			return;
		}
	};

	tt.Runtime.prototype.completeLoad_ = function(opt_error) {
		if (opt_error) {
			this.isLoaded_ = false;
			this.error_ = opt_error;
		} else {
			this.isLoaded_ = true;
			this.error_ = null;
		}
		while (this.readyWaiters_.length) {
			var waiter = this.readyWaiters_.shift();
			waiter[0].call(waiter[1], opt_error || null);
		}
	};
 
	tt.Runtime.prototype.poll = function(state) {
		state.hmd.present = false;
		this.dataSource_.poll(state);
		if (state.hmd.present && !this.hmdInfo_) {
			this.hmdInfo_ = this.dataSource_.queryHmdInfo();
		} else if (!state.hmd.present && this.hmdInfo_) {
			this.hmdInfo_ = null;
		}
		return true;
	};

	tt.runtime_ = new tt.Runtime(global.document);

	tt.isInstalled = function() {
		return tt.runtime_.isInstalled_;
	};

	tt.isLoaded = function() {
		return tt.runtime_.isLoaded_;
	};

	tt.getError = function() {
		return tt.runtime_.error_;
	};

	tt.load = function(opt_callback, opt_scope) {
		tt.runtime_.load(opt_callback, opt_scope);
	};

	tt.getHmdInfo = function() {
		return tt.runtime_.hmdInfo_;
	};

	tt.resetHmdOrientation = function() {
		tt.runtime_.dataSource_.resetHmdOrientation();
	};

	tt.pollState = function(state) {
		return tt.runtime_.poll(state);
	};

	tt.waitForDomReady = function(document, callback, opt_scope) {
		if (document.readyState == 'interactive' ||
		document.readyState == 'complete') {
			global.setTimeout(function() {
				callback.call(opt_scope);
			}, 0);
		} else {
			var initialize = function() {
				document.removeEventListener('DOMContentLoaded', initialize, false);
				callback.call(opt_scope);
			};
			document.addEventListener('DOMContentLoaded', initialize, false);
		}
	};

	tt.log = function(var_args) {
		if (global.console && global.console.log) {
			global.console.log.apply(global.console, arguments);
		}
	};
 
	tt.HmdInfo = function(opt_values) {
		var o = 0;
		this.desktopX = 0;
		this.desktopY =  0;
		this.resolutionHorz = 0;
		this.resolutionVert =0;
		this.screenSizeHorz = 0.14976;
		this.screenSizeVert = 0.0936;
		this.screenCenterVert =  270 / 2;
		this.eyeToScreenDistance =0.06;
		this.lensSeparationDistance = 0.0635; //L
		this.interpupillaryDistance =0.0635; //Interpupillary
		
	};
 

	tt.HmdInfo.DEFAULT = new tt.HmdInfo();

	tt.HmdState = function() {
		this.present = false;
		this.rotation = new Float32Array(4);
		this.forces = new Float32Array(1024);
	};

	tt.State = function() {
		this.hmd = new tt.HmdState();
	};



	global.tt = tt;

})(window);
